# scripts that aggregate data from multiple sources
import json
import os
import pandas as pd
from datetime import datetime
from typing import List, Dict, Any

# merge two JSON files
def merge_json_files(file_hotest: str, file_upvote: str) -> pd.DataFrame:
    """
    Merges two JSON files into a single DataFrame.
    
    Args:
        file1 (str): Path to the first JSON file.
        file2 (str): Path to the second JSON file.
    
    Returns:
        pd.DataFrame: Merged DataFrame containing data from both files.
    """
    with open(file_hotest, 'r', encoding='utf-8') as f1, open(file_upvote, 'r', encoding='utf-8') as f2:
        hotest_data = json.load(f1)
        upvote_data = json.load(f2)

    # Convert to DataFrames
    df1 = pd.DataFrame(hotest_data).assign(ranking_type='hotest')
    df2 = pd.DataFrame(upvote_data).assign(ranking_type='upvote')

    # Merge DataFrames
    merged_df = pd.concat([df1, df2], ignore_index=True)
    
    return merged_df

def calculate_category_proportions(df: pd.DataFrame) -> Dict[str, float]:
    """
    Calculate the proportion of each category in the DataFrame.
    
    Args:
        df (pd.DataFrame): DataFrame containing dataset information.
    
    Returns:
        Dict[str, float]: Dictionary with category names as keys and their proportions as values.
    """
    return df['ai_category'].value_counts(normalize=True).to_dict()


def append_to_csv_file(data: Dict[str, Any], file_path: str) -> None:
    """
    Append data to a CSV file with organized columns.
    
    Args:
        data (Dict[str, Any]): Data to append.
        file_path (str): Path to the CSV file.
    """
    today = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data['record_time'] = today
    df = pd.DataFrame([data])
    
    # If file exists, read existing columns and reorder new data
    if os.path.exists(file_path):
        existing_df = pd.read_csv(file_path)
        existing_df['record_time'] = pd.to_datetime(existing_df['record_time'])
        # Get the latest record time from existing data
        last_record_time = existing_df['record_time'].dt.date.max()


        # check if column names are the same
        if set(df.columns) != set(existing_df.columns):
            raise ValueError("Column names do not match with existing CSV file.")
        
        # if the the lastest record has the same record_time, skip
        if datetime.strptime(today, "%Y-%m-%d %H:%M:%S").date() == last_record_time:
            print("No new data to append.")
            return

        # Reorder new data to match existing columns
        df = df.reindex(columns=existing_df.columns)

        
    
    df.to_csv(file_path, mode='a', header=not os.path.exists(file_path), index=False)



full_data = merge_json_files(
    file_hotest='data/hottest_datasets.json',
    file_upvote='data/most_votes_datasets.json'
)

prop = calculate_category_proportions(full_data)

append_to_csv_file(
    data=prop,
    file_path='data/cate_trends.csv'
)


print(f"✅ Merged {len(full_data)} datasets from hotest and upvote rankings.")

