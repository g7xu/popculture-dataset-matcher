from google import genai
from dotenv import load_dotenv
import time
import os

# load api key
load_dotenv()


API_KEY = os.getenv("GOOGLE_API_KEY")
PROMPT = ""
CATEGORIES = [
        "Film & Television Media",
        "Music & Audio Trends",
        "Gaming & Interactive Media",
        "Internet & Digital Culture",
        "Lifestyle & Consumer Aesthetics",
        "Fandoms & Cultural Expression"
    ]


def prompt_config(title: str, description: str, tags: str) -> str:
    

    categories_str = ", ".join(CATEGORIES)

    prompt = f"""
    You are a content classification assistant trained to assign datasets to specific pop culture categories.

    Here are the 6 available categories:
    {categories_str}

    Your job is to return exactly **one** category name that best matches the dataset based on its title, description, and tags.

    Dataset Info:
    - Title: {title}
    - Description: {description}
    - Tags: {', '.join(tags)}

    Reply with one category name only, and do not explain your answer.
    """

    return prompt.strip()

def get_single_word_response(title: str, description: str, tags: str, retry_count = 0) -> str:
    """
    Uses Gemini Flash model to generate a single-word response from a prompt.

    Args:
        prompt (str): Prompt input for Gemini.

    Returns:
        str: Single-word response.
    """
    if retry_count > 3:
        raise ValueError("Max retries exceeded")

    if not API_KEY:
        raise ValueError("Missing environment variable: GOOGLE_API_KEY")


    try:

        # Initialize the Gemini client
        client = genai.Client(api_key=API_KEY)

        prompt = prompt_config(title, description, tags)

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[prompt],
        )
        return response.text.strip()
    
    # handle the resource exhausted error
    except Exception as e:
        if "429" in str(e) or "resource_exhausted" in str(e).lower():
            print(f"Rate limit exceeded, wait for 60 seconds: {e}")
            time.sleep(30)  # Wait for 60 seconds before retrying
            return get_single_word_response(title, description, tags, retry_count + 1)
        else:
            print(f"Unexpected error occurred: {e}")
            raise

# Example usage
if __name__ == "__main__":
    title = "Panda"
    description = "This is a dataset that analysis the panda population"
    tags = ["animal", "statistic", "population"]

    category = get_single_word_response(title, description, tags)
    print(f"Assigned Category: {category}")