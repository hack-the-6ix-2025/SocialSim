from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import time

class GeminiEvaluator:
    models = [
        "gemini-1.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
    ]
    client = None
    def __init__(self):
        load_dotenv()
        self.client = genai.Client(api_key=os.environ.get("GOOGLE_GEMINI_API_KEY"))

    def evaluate(self, prompt: str):
        response: str = ""
        base_promopt = ""
        with open(os.path.join(os.path.dirname(__file__), "base_prompt_GEMINI.txt"), "r") as f:
            base_promopt = "\n".join(f.readlines())
        for model in self.models:
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=f"{base_promopt}\n{prompt}"
                )
                time.sleep(1)
                if response and response.text:
                    return str(response.text).strip()
            except Exception as e:
                print(f"Exception while prompting Gemini: {e}.")
                fix_response = None
                for model in self.models:
                    fix_response = self.client.models.generate_content(
                        model=model,
                        contents=f"Please fix the error: {e}. Provide a valid response.",
                        config=types.GenerateContentConfig(
                            thinking_config=types.ThinkingConfig(thinking_budget=0)
                        )
                    )
                    time.sleep(1)
                    if fix_response and fix_response.text:
                        print(f"Fix from AI: {fix_response.text}")
                        break
                    else:
                        continue
                continue
        return response

if __name__ == "__main__":
    evaluator = GeminiEvaluator()
    test_prompt = ""
    with open(os.path.join(os.path.dirname(__file__), "sample_summary.txt"), "r") as f:
        test_prompt = "\n".join(f.readlines())
    result = evaluator.evaluate(test_prompt)
    print(f"Evaluation Result: {result}")