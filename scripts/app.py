import requests
import boto3
import uuid
from botocore.config import Config


# Config
UNSPLASH_ACCESS_KEY = "Client-ID nDntUG-sKdJXJm80PswrRZ8fxvi--2I5VafxSKQ9WkA"

# Cloudflare R2 config
R2_ACCOUNT_ID = "edf60ae8b2fc6aff8921726462782ce5"

R2_ACCESS_KEY_ID = "e7e46bc8d6dc72d016a1f225f6009d8b"
R2_SECRET_ACCESS_KEY = "3771c46c044e06c4563dde6c59c50453262b12bfe446fc017f82a8eb20d23072"
R2_BUCKET_NAME = "tools"
R2_PREFIX = "images/"
R2_ENDPOINT_URL = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"


# Optional: central config for the R2 S3 client
R2_S3_CONFIG = Config(
    signature_version="s3v4",
    s3={"addressing_style": "path"},
)

query = "tiger"

# 1. Search Unsplash
search_url = "https://api.unsplash.com/search/photos"
headers = {
    # use the access key as-is (it already contains 'Client-ID ')
    "Authorization": UNSPLASH_ACCESS_KEY,
}

params = {
    "query": query,
    "per_page": 1
}

search_response = requests.get(search_url, headers=headers, params=params)
search_response.raise_for_status()

data = search_response.json()

photo = data["results"][0]

# 2. (optional) Get image download URL for tracking (not used for download here)
download_location = photo["links"]["download_location"]

download_resp = requests.get(
    download_location,
    headers=headers
)
download_resp.raise_for_status()

# Use the regular image URL from the search result
image_url = photo["urls"]["regular"]
print("Regular image URL:", image_url)

# 3. Download image (if you want to actually fetch it, uncomment below)

image_resp = requests.get(image_url)
image_resp.raise_for_status()

image_bytes = image_resp.content
content_type = image_resp.headers.get("Content-Type", "image/jpeg")

# 4. Upload to Cloudflare R2 (S3-compatible)
s3 = boto3.client(
    "s3",
    region_name="auto",
    endpoint_url=R2_ENDPOINT_URL,
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    config=R2_S3_CONFIG,
)

key = f"{R2_PREFIX}{uuid.uuid4()}.jpg"

s3.put_object(
    Bucket=R2_BUCKET_NAME,
    Key=key,
    Body=image_bytes,
    ContentType=content_type,
)

print("Uploaded:", f"r2://{R2_BUCKET_NAME}/{key}")

# 5. Attribution (IMPORTANT)
print("Photo by:", photo["user"]["name"])
print("Unsplash link:", photo["links"]["html"])
