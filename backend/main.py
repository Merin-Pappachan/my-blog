from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from db import supabase
from models import Post

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return{"message":"Backend running"}
#Get all posts
@app.get("/posts")
def get_posts():
    response = supabase.table("posts").select("*").order("created_at", desc=True).execute()
    return response.data

#Get single post by slug
@app.get("/posts/{slug}")
def get_post(slug: str):
    response = supabase.table("posts").select("*").eq("slug", slug).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Post not found")

    return response.data[0]

#Create post
@app.post("/posts")
def create_post(post: Post):
    response = supabase.table("posts").insert(post.dict()).execute()
    return response.data