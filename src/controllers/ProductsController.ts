import { Request, Response } from "express";
import db from "../database/connection";

export default class ProductsController {
  async getProducts(_: Request, response: Response) {
    const products = await db("products").select("*");
    return response.json(products);
  }

  async postProduct(request: Request, response: Response) {
    const { body } = request;

    const trx = await db.transaction();

    try {
      await trx("products").insert(body);
      await trx.commit();

      return response.status(201).json({
        success: "Novo produto cadastrado com sucesso!"
      });


    } catch (e) {
      await trx.rollback();
      
      return response.status(400).json({
        error: "Erro desconhecido ao tentar cadastrar um novo produto"
      });
    }
  }

  async updateProduct(request: Request, response: Response) {
    const { id } = request.params;
    const changes = request.body;

    const productId = id as string;

    const trx = await db.transaction();

    try {
      await trx("products").where({ id: productId }).update(changes);
      await trx.commit();

      return  response.status(201).json({
        success: "Produto atualizado com sucesso!"
      });
    } catch (e) {
      await trx.rollback();

      console.log(e)
      
      return response.status(400).json({
        error: "Erro desconhecido ao tentar atualizar produto."
      });
    }
  }

  async deleteProduct(request: Request, response: Response) {
    const { id } = request.query;

    const productId = id as string;

    const trx = await db.transaction();

    try {
      await trx("products").where("products.id", "=", productId).delete();
      await trx.commit();

      return  response.status(201).json({
        success: "Produto excluído com sucesso!"
      });
    } catch (e) {
      await trx.rollback();
      
      return response.status(400).json({
        error: "Erro desconhecido ao tentar excluir produto."
      });
    }
  }
}
