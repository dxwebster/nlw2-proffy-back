import { Knex } from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('products', (table:any) => {
    table
    .increments('id')
    .primary();

    table
    .string('title')
    .notNullable();

    table
    .string('image')
    .notNullable();

    table
    .decimal('price')
    .notNullable();

    table
    .decimal('brand')
    .notNullable();

    table
    .string('description')
    .notNullable();

    table
    .integer('storeId')
    .notNullable()
    .references('id')
    .inTable('stores')
    .onUpdate('CASCADE')
    .onDelete('CASCADE');     
  })
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('products');
}