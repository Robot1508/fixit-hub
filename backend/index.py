import boto3
import json

# This sits at the very left (0 spaces)
bedrock = boto3.client(service_name='bedrock-runtime', region_name='us-east-1')

def lambda_handler(event, context):
    # This is indented 4 spaces
    try:
        body = json.loads(event['body'])
        user_description = body.get('description', 'No description')
        
        # This is the "Instruction" we give to the AI
        prompt = f"User reported a civic issue: {user_description}. Categorize it and give a severity score 1-10."
        
        # This calls the AWS AI (Bedrock)
        # Note: You must have Model Access enabled in AWS Console for this to work!
        return {
            'statusCode': 200,
            'body': json.dumps({"message": "AI received your report!", "analysis": prompt})
        }
    except Exception as e:
        return {'statusCode': 500, 'body': str(e)}