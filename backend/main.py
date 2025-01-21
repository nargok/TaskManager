from fastapi import FastAPI

app = FastAPI()

@app.get("/hello")
async def hello():
    return {"message": "Hello from FastAPI!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
