from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI()

model = SentenceTransformer("all-MiniLM-L6-v2")

class TextInput(BaseModel):
    text: str

@app.get("/")
def health():
    return {"status": "AI server working"}

@app.post("/embed")
def embed(input: TextInput):
    embedding = model.encode(input.text).tolist()
    return {"embedding": embedding}