import os
import uuid
import base64
import asyncio
import replicate
import httpx
import aiofiles

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/ai", tags=["services"])


# --- Endpoint Definition ---
@router.post("/process-image", status_code=status.HTTP_201_CREATED, summary="Process an image with Replicate")
async def process_image(
    file: UploadFile = File(...,
                            description="The image file to be processed."),
    prompt: str = Form(..., description="The text prompt for image editing (e.g., 'replace moth with a small hummingbird')."),
):
    """
    Receives an image file and a text prompt, sends them to Replicate for editing,
    saves the resulting image to the static directory, and returns its public URL.
    """
    print(f"Received file: {file.filename}, content_type: {file.content_type}")
    print(f"Received prompt: {prompt}")

    # 1. Read the uploaded image and convert to base64 Data URI
    try:
        contents = await file.read()
        # Ensure the file is an image
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is not an image."
            )

        encoded_image = base64.b64encode(contents).decode("utf-8")
        # Construct a data URI for Replicate's input
        data_uri = f"data:{file.content_type};base64,{encoded_image}"
        print("Image converted to Data URI.")

    except Exception as e:
        print(f"Error reading or encoding image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not process image file: {e}"
        )

    # 2. Call Replicate API for image processing
    # Ensure REPLICATE_API_TOKEN environment variable is set.
    # For example: export REPLICATE_API_TOKEN="r8_YOUR_API_TOKEN_HERE"
    # Your specified version
    replicate_model_version = "12b5a5a61e3419f792eb56cfc16eed046252740ebf5d470228f9b4cf2c861610"

    try:
        print(f"Calling Replicate with version: {replicate_model_version}")
        prediction = await replicate.predictions.async_create(
            version=replicate_model_version,
            input={"image": data_uri, "prompt": prompt}
        )
        print(
            f"Replicate prediction initiated. ID: {prediction.id}, Status: {prediction.status}")

        # Poll for the prediction result
        # In a production environment, consider using webhooks for better scalability
        # instead of long-polling.
        retries = 0
        while prediction.status not in ["succeeded", "failed", "canceled"]:
            await asyncio.sleep(1)  # Wait for 1 second before checking again
            prediction = await replicate.predictions.async_get(prediction.id)
            retries += 1
            print(
                f"Polling Replicate prediction {prediction.id}. Current Status: {prediction.status}")

        if prediction.status != "succeeded":
            error_detail = prediction.error or "Unknown Replicate error."
            print(
                f"Replicate prediction failed or timed out. Status: {prediction.status}, Error: {error_detail}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Replicate prediction failed or timed out: {error_detail}"
            )

        if not prediction.output:
            print("Replicate prediction succeeded but returned no output image URL.")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Replicate prediction succeeded but returned no output image."
            )

        output_image_url = prediction.output
        print(
            f"Replicate prediction succeeded. Output URL: {output_image_url}, in {retries} seconds")
        return JSONResponse(
            content={
                "message": "Image processed and saved successfully",
                "image_url": output_image_url
            },
            status_code=status.HTTP_201_CREATED
        )

    except Exception as e:
        print(f"An unexpected error occurred during Replicate call: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during image processing: {e}"
        )

    # 4. Return the URL of the edited image
    return JSONResponse(
        content={
            "message": "Image processed and saved successfully",
            "image_url": public_image_url
        },
        status_code=status.HTTP_201_CREATED
    )
