import boto3
import json
import base64

bedrock = boto3.client(service_name='bedrock-runtime', region_name='us-east-1')

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        user_text = body.get('description', 'No description provided')
        image_bytes = body.get('image') # Base64 string

        # Use Claude 3.5 Sonnet (Recommended)
        model_id = "anthropic.claude-3-5-sonnet-20240620-v1:0"
        
        prompt_config = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 500,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": f"Analyze this civic issue: {user_text}. Return ONLY a JSON object with 'category', 'severity_score' (1-10), and a 'summary'."},
                        {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": image_bytes}}
                    ]
                }
            ]
        }

        response = bedrock.invoke_model(
            modelId=model_id,
            body=json.dumps(prompt_config),
            guardrailIdentifier="fixit-equity-guardrail",
            guardrailVersion="DRAFT"
        )

        result = json.loads(response.get('body').read())
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }
    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}