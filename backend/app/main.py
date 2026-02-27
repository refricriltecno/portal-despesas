import os
import certifi
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URL = "mongodb+srv://tecnologia_db_user:AdmRef212@refricril.lfg6bem.mongodb.net/?appName=Refricril"
client = AsyncIOMotorClient(MONGO_URL, tlsCAFile=certifi.where())
db = client.portal_refricril

class ContratoSchema(BaseModel):
    nomeAmigavel: str
    filial: str
    tipo: str
    centroCusto: str
    valorTotal: float
    duracao: int
    valorMensal: str
    fornecedor1: str
    cnpj1: str
    status: str = "Ativo"
    # Adicionando os campos que estavam faltando (usamos Optional para não dar erro se vierem vazios)
    dataInicio: Optional[str] = None
    circ1: Optional[str] = None
    tags: Optional[str] = None
    info: Optional[str] = None
    fornecedor2: Optional[dict] = None
    isRateado: Optional[bool] = False

# --- ROTAS DE CONTRATOS ---

@app.get("/api/contratos")
async def listar_contratos():
    contratos = []
    async for c in db.contratos.find():
        c["id"] = str(c["_id"])
        del c["_id"]
        contratos.append(c)
    return contratos

@app.post("/api/contratos")
async def criar_contrato(contrato: ContratoSchema):
    result = await db.contratos.insert_one(contrato.dict())
    return {"id": str(result.inserted_id)}

# CORREÇÃO DO ERRO 405: Rota para Atualizar (PUT)
@app.put("/api/contratos/{id}")
async def atualizar_contrato(id: str, contrato: ContratoSchema):
    await db.contratos.update_one({"_id": ObjectId(id)}, {"$set": contrato.dict()})
    return {"status": "updated"}

@app.delete("/api/contratos/{id}")
async def deletar_contrato(id: str):
    await db.contratos.delete_one({"_id": ObjectId(id)})
    return {"status": "deleted"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)