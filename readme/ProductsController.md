import { Request, Response } from "express";
import db from "../database/connection";
import convertHourToMinutes from "../utils/convertHourToMinutes";

export default class ConnectionsController {
  // -------- Função que que lista as aulas  --------
  async index(request: Request, response: Response) {
    const filters = request.query;

    const subject = filters.subject as string;
    const week_day = filters.week_day as string;
    const time = filters.time as string;

    // Nossa listagem só poderá ser feita caso tenha pelo menos um dos filtros.
    // Para isso vamos fazer um if para caso não existir esses filtros, retornamos um erro.
    if (!filters.week_day || !filters.subject || !filters.time) {
      return response.status(400).json({
        error: "Missing filters to search classes",
      });
    }

    // Agora vamos converter o horário enviado em minutos usando nossa função convertHourToMinutes() armazenar num variável.
    const timeInMinutes = convertHourToMinutes(time);

    // Agora vamos para a query de busca na tabela 'classes'.
    // Com umas funções do knex conseguimos fazer algumas comparações para buscar aquilo que foi filtrado.
    const classes = await db("classes")
      .whereExists(function() {
        this.select("class_schedule.*") // seleciona todos os campos da tabela 'class_schedule'
          .from("class_schedule")
          .whereRaw("class_schedule.class_id = classes.id") // pesquisa todos os agendamentos que tem o class_id igual ao buscado
          .whereRaw("class_schedule.week_day = ??", [Number(week_day)]) // pesquisa todos os agendamentos que o dia da semana for igual ao buscado
          .whereRaw("class_schedule.from <= ??", [timeInMinutes]) // pesquisa todos os agendamentos que tem horário menor ou igual ao buscado
          .whereRaw("class_schedule.to > ??", [timeInMinutes]); // pesquisa todos os agendamentos que que tem horário maior que o buscado
      })
      .where("classes.subject", "=", subject)
      .join("users", "classes.user_id", "=", "users.id")
      .select(["classes.*", "users.*"]);

    return response.json(classes);
  }

  // -------- Função que que cria um novo produto --------
  async create(request: Request, response: Response) {
    // Pega todas as informações do corpo da requisição 
    // para inserir cada uma em sua própria tabela.

    const {
      name,
      logo,
      segment,
      title,
      image,
      price,
      description
    } = request.body;

    // Precisamos agora usar uma função chamada 'transaction()' que prepara as inserções no banco.
    // A inserção só é feita caso não dê erro em nenhuma delas.
    const trx = await db.transaction();

    // Agora vamos usar o 'try' para fazer a tentativa de inserção no banco de dados.
    // Dentro dele colocamos nossas querys, que vai pegar determinados dados e inserir em suas respectivas tabelas.
    try {
      // Prepara a query de inserção na tabela 'stores'
      const storesId = await trx("stores").insert({ name, logo, segment });

      // Prepara a query de inserção na tabela 'classes'
      await trx("products").insert({ title, image, price, description, storeId: storesId[0] });
      
      // Como estamos usando o transaction, todas as querys estão apenas esperando o commit para realmente rodarem.
      // Com todas as inserções preparadas, podemos fazer o commit() que faz as inserções nas tabelas.
      await trx.commit();

      // Se der certo as inserções, aparece a mensagem de confirmação
      return response.status(201).json({ success: "Novo produto cadastrado com sucesso!" });

      // Aqui fechamos o 'try' e chamamos o chatch que vai expor se deu erro.
    } catch (e) {
      await trx.rollback();// desfaz qualquer alteração no banco
      
      return response.status(400).json({ error: "Erro desconhecido ao tentar cadastrar um novo produto" });// retorna a mensagem de erro
    }
  }
}
