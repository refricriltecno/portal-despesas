import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId

app = FastAPI()

# Permite que o seu React (mesmo no Render) acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# SUA URL DO ATLAS
MONGO_URL = "mongodb+srv://tecnologia_db_user:AdmRef212@refricril.lfg6bem.mongodb.net/?appName=Refricril"
client = AsyncIOMotorClient(MONGO_URL)
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

@app.delete("/api/contratos/{id}")
async def deletar_contrato(id: str):
    await db.contratos.delete_one({"_id": ObjectId(id)})
    return {"status": "success"}