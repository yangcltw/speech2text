from typing import List, Dict
import numpy as np
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
import logging

class VectorStore:
    def __init__(self, embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.embeddings = HuggingFaceEmbeddings(model_name=embedding_model)
        self.db = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
    def create_from_documents(self, documents: List[str], metadata: List[Dict] = None):
        """從文件創建向量數據庫"""
        try:
            texts = self.text_splitter.split_documents(documents)
            self.db = Chroma.from_documents(
                documents=texts,
                embedding=self.embeddings,
                metadatas=metadata
            )
        except Exception as e:
            logging.error(f"Failed to create vector store: {str(e)}")
            raise
            
    def query(self, query: str, k: int = 3) -> List[Dict]:
        """查詢相關文件"""
        if not self.db:
            raise ValueError("Vector store not initialized")
            
        return self.db.similarity_search(query, k=k)