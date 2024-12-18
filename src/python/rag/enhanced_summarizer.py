from typing import List, Dict, Optional
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from .vector_store import VectorStore
import logging

class RAGSummarizer:
    def __init__(self, 
                 model_name: str = "facebook/bart-large-cnn",
                 knowledge_base_path: Optional[str] = None):
        self.model = None
        self.tokenizer = None
        self.vector_store = VectorStore()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.load_model(model_name)
        if knowledge_base_path:
            self.load_knowledge_base(knowledge_base_path)
            
    def load_model(self, model_name: str):
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSeq2SeqLM.from_pretrained(
                model_name
            ).to(self.device)
        except Exception as e:
            logging.error(f"Failed to load model: {str(e)}")
            raise
            
    def load_knowledge_base(self, path: str):
        """載入知識庫文件"""
        import json
        try:
            with open(path, 'r', encoding='utf-8') as f:
                knowledge_base = json.load(f)
            self.vector_store.create_from_documents(
                documents=knowledge_base['documents'],
                metadata=knowledge_base.get('metadata')
            )
        except Exception as e:
            logging.error(f"Failed to load knowledge base: {str(e)}")
            raise
            
    def generate_prompt(self, text: str, context_type: str) -> str:
        """根據上下文生成提示詞"""
        relevant_docs = self.vector_store.query(text)
        
        if context_type == "meeting":
            prompt = "Based on similar meetings:\\n"
        elif context_type == "medical":
            prompt = "Based on medical guidelines:\\n"
        elif context_type == "customer_service":
            prompt = "Based on service protocols:\\n"
        else:
            prompt = "Based on relevant context:\\n"
            
        for doc in relevant_docs:
            prompt += f"- {doc.page_content}\\n"
            
        prompt += f"\\nSummarize this content:\\n{text}"
        return prompt
        
    def summarize(self, 
                 text: str, 
                 context_type: str = "general",
                 max_length: int = 150) -> Dict:
        try:
            prompt = self.generate_prompt(text, context_type)
            
            inputs = self.tokenizer(prompt, return_tensors="pt", max_length=1024, truncation=True)
            summary_ids = self.model.generate(
                inputs["input_ids"].to(self.device),
                max_length=max_length,
                min_length=30,
                num_beams=4,
                length_penalty=2.0,
                early_stopping=True
            )
            
            summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            
            return {
                "summary": summary,
                "context_used": prompt
            }
            
        except Exception as e:
            logging.error(f"Summarization failed: {str(e)}")
            raise