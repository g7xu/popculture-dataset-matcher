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

# Function to fetch datasets and process them
def fetch_and_process_datasets(sort_by, output_filename):
    dataset_list = []

    for page_num in range(1, PAGE_NUM + 1):
        print(f"Fetching page {page_num} datasets sorted by {sort_by}...")
        datasets = api.dataset_list(sort_by=sort_by, page=page_num)

        # Filter datasets
        for ds in datasets:
            dataset_list.append({
                "title": ds.title,
                "ref": ds.ref,
                "url": ds.url,
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

    # Convert to DataFrame
    df = pd.DataFrame(dataset_list)

    # Convert bytes to MB (numeric)
    df["sizeMB"] = df["size"].apply(lambda x: None if pd.isna(x) else round(x / (1024 * 1024), 2))

    # Select & reorder final fields
    df = df[[
        "title", "ref", "description", "creator", "sizeMB",
        "downloadCount", "usabilityRating", "tags", "lastUpdated", "ai_category"
    ]]

    # Save to JSON
    os.makedirs("data", exist_ok=True)
    output_path = f"data/{output_filename}"
    df.to_json(output_path, orient="records", indent=2, force_ascii=False)

    print(f"✅ Saved {len(df)} datasets to {output_path}")

# Fetch and save datasets sorted by 'votes'
fetch_and_process_datasets(sort_by='votes', output_filename='most_votes_datasets.json')

# Fetch and save datasets sorted by 'hottest'
fetch_and_process_datasets(sort_by='hottest', output_filename='hottest_datasets.json')