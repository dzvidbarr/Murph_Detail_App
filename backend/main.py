from fastapi import FastAPI

# Creates the API application 
app = FastAPI()

# When someone sends a GET request to "/", it will run the function below 
@app.get("/")
def root():
    return {"message": "Murph Detail API is running"}