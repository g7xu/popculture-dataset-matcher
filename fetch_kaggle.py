import os
import json
import pandas as pd
import re
from kaggle.api.kaggle_api_extended import KaggleApi

from ai_categorization import get_single_word_response

PAGE_NUM = 5

# Step 1: Authenticate
api = KaggleApi()
api.authenticate()


dataset_list = []

for page_nunm in range(1, PAGE_NUM + 1):
    print(f"Fetching page {page_nunm} datasets...")
    datasets = api.dataset_list(sort_by='votes', page=page_nunm)

    # Filter datasets
    for ds in datasets:
                
        dataset_list.append({
            "title": ds.title,
            "ref": ds.ref,
            "description": ds.subtitle,
            "creator": ds.creator_name,
            "size": ds.total_bytes,  # in bytes
            "downloadCount": ds.download_count,
            "usabilityRating": ds.usability_rating,
            "tags": [t.name for t in ds.tags],  # tag objects → string list
            "lastUpdated": ds.last_updated,
            "ai_category": get_single_word_response(
                ds.title,
                ds.subtitle,
                [t.name for t in ds.tags]
            )
        })

# Step 4: Convert to DataFrame
df = pd.DataFrame(dataset_list)

# Step 5: Convert bytes to MB (numeric)
def bytes_to_mb(bytes_val):
    if pd.isna(bytes_val): return None
    return round(bytes_val / (1024 * 1024), 2)

df["sizeMB"] = df["size"].apply(bytes_to_mb)


# Step 6: Select & reorder final fields
df = df[[
    "title", "ref", "description", "creator", "sizeMB",
    "downloadCount", "usabilityRating", "tags", "lastUpdated"
]]

# Step 7: Save to JSON
os.makedirs("data", exist_ok=True)
output_path = "data/most_votes_datasets.json"
df.to_json(output_path, orient="records", indent=2, force_ascii=False)

print(f"✅ Saved {len(df)} datasets to {output_path}")

dataset_list = []

for page_nunm in range(1, PAGE_NUM + 1):
    print(f"Fetching page {page_nunm} datasets...")
    datasets = api.dataset_list(sort_by='hottest', page=page_nunm)

    # Filter datasets
    for ds in datasets:
        dataset_list.append({
            "title": ds.title,
            "ref": ds.ref,
            "description": ds.subtitle,
            "creator": ds.creator_name,
            "size": ds.total_bytes,  # in bytes
            "downloadCount": ds.download_count,
            "usabilityRating": ds.usability_rating,
            "tags": [t.name for t in ds.tags],  # tag objects → string list
            "lastUpdated": ds.last_updated,
            "ai_category": get_single_word_response(
                ds.title,
                ds.subtitle,
                [t.name for t in ds.tags]
            )
        })

# Step 4: Convert to DataFrame
df = pd.DataFrame(dataset_list)

# Step 5: Convert bytes to MB (numeric)
def bytes_to_mb(bytes_val):
    if pd.isna(bytes_val): return None
    return round(bytes_val / (1024 * 1024), 2)

df["sizeMB"] = df["size"].apply(bytes_to_mb)


# Step 6: Select & reorder final fields
df = df[[
    "title", "ref", "description", "creator", "sizeMB",
    "downloadCount", "usabilityRating", "tags", "lastUpdated", "ai_category"
]]

# Step 7: Save to JSON
os.makedirs("data", exist_ok=True)
output_path = "data/hottest_datasets.json"
df.to_json(output_path, orient="records", indent=2, force_ascii=False)

print(f"✅ Saved {len(df)} datasets to {output_path}")