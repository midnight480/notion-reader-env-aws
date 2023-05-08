import csv
import os
import json
from datetime import datetime
import requests
import boto3
from dotenv import load_dotenv

# dotenvからNotion API Key, Notion Page ID, S3バケット名を読み込む
load_dotenv()
NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_PAGE_ID = os.getenv("NOTION_PAGE_ID")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

# Notion APIのURL
notion_api_url = f"https://api.notion.com/v1/blocks/{NOTION_PAGE_ID}/children"

# Notion APIのヘッダー
headers = {
    "Notion-Version": "2022-06-28",
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json"
}

s3_client = boto3.client("s3")

def handler(event, context):
    # Notion APIを実行して得られたJSONから、BlockのIDとplain_textを抽出
    response = requests.get(notion_api_url, headers=headers)

    if response.status_code == 200:
        # JSONからBlockのIDとplain_textを抽出
        blocks = response.json()["results"]
        extracted_data = []

        for block in blocks:
            block_type = block["type"]
            supported_block_types = ["paragraph", "heading_1", "heading_2", "heading_3", "bulleted_list_item", "to_do"]
            if block["object"] == "block" and block_type in supported_block_types:
                block_id = block["id"]
                rich_text = block[block_type]["rich_text"]
                if rich_text:
                    plain_text = "".join([rt_item["plain_text"] for rt_item in rich_text])
                    extracted_data.append((block_id, plain_text))

        # plain_textのみ抽出して変数をCSV形式に変換
        csv_data = []

        for block_id, plain_text in extracted_data:
            extracted_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            csv_data.append([block_id, extracted_datetime, plain_text])

        # CSV形式に変換した結果をファイルに出力
        with open("/tmp/notion-page-croll.csv", "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["Block ID", "Extracted Datetime", "Plain Text"])
            writer.writerows(csv_data)

        # S3にCSVファイルをアップロード
        s3_client.upload_file("/tmp/notion-page-croll.csv", S3_BUCKET_NAME, "notion-page-croll.csv")

        return {
            'statusCode': 200,
            'body': json.dumps('CSV file has been successfully uploaded to S3!')
        }

    else:
        print("Error:", response.status_code)
        print(response.text)
        return {
            'statusCode': 500,
        }
