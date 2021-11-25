import { Request, Response } from "express";
import db from "../database/connection";

export default class StoresController {
  async getStores(_: Request, response: Response) {

    const stores = await db("stores").select("*");
    return response.json(stores);
    
  }
  
  async postStore(request: Request, response: Response) {
    const { body } = request;

    const trx = await db.transaction();

    try {
      await trx("stores").insert(body);
      await trx.commit();

      return response.status(201).json({
        success: "Loja cadastrada com sucesso!"
      });

    } catch (e) {
      await trx.rollback();
      
      return response.status(400).json({
        error: "Erro desconhecido ao tentar cadastrar loja"
      });
    }
  }
  
  async deleteStore(request: Request, response: Response) {
    const { id } = request.query;

    const storeId = id as string;

    const trx = await db.transaction();

    try {
      await trx("stores").where("stores.id", "=", storeId).delete();
      await trx.commit();

      return  response.status(201).json({
        success: "Loja excluída com sucesso!"
      });
    } catch (e) {
      await trx.rollback();
      
      return response.status(400).json({
        error: "Erro desconhecido ao tentar excluir loja."
      });
    }
  }
}
