from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

index_name = "clarityai"

def save_to_database(text_data):
    embeddings = pc.inference.embed(
        model="multilingual-e5-large",
        inputs=[d['text'] for d in text_data],
        parameters={"input_type": "passage", "truncate": "END"}
    )

    index = pc.Index(index_name)

    records = []
    for d, e in zip(text_data, embeddings):
        records.append({
            "id": d['id'],
            "values": e['values'],
            "metadata": {'text': d['text']}
        })

    index.upsert(
        vectors=records,
        namespace="clarityai"
    )

    return True

def query_and_generate(user_query, text=None, use_context=True, top_k=3):
    if use_context:
        query_embedding = pc.inference.embed(
            model="multilingual-e5-large",
            inputs=[user_query],
            parameters={
                "input_type": "query"
            }
        )

        try:
            index = pc.Index(index_name)
            
            results = index.query(
                namespace="clarityai",
                vector=query_embedding[0].values,
                top_k=top_k,
                include_values=False,
                include_metadata=True
            )
            
            context = "\n".join([match['metadata']['text'] for match in results['matches']])
            
            prompt = f"""Based on the following context, please answer the query to teach people about the context:
                
            Context:
            {context}

            Query: {user_query}

            Please provide a detailed response only from the context and some of your own knowledge. No special markdown formatting."""

            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful teacher that teaches people about the content based on the provided context."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )
            
            return {
                "answer": completion.choices[0].message.content,
                "sources": [match['metadata']['text'] for match in results['matches']]
            }
        except Exception as e:
            print(f"Error: {str(e)}")
    else:
        try:
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful teacher that teaches people about the content based on the provided context."},
                    {"role": "user", "content": user_query}
                ],
                temperature=0.7,
                max_tokens=300
            )
            
            return {
                "answer": completion.choices[0].message.content,
                "sources": []
            }
        except Exception as e:
            print(f"Error: {str(e)}")