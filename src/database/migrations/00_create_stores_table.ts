import { Knex } from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('stores', (table:any) => {
    table
    .increments('id')
    .primary();

    table
    .string('name')
    .notNullable();

    table
    .string('logo')
    .notNullable();

    table
    .string('segment')
    .notNullable();
  })
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('stores');
}