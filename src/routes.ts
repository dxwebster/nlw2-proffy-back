import express from 'express';
import StoresController from './controllers/StoresController';
import ProductsController from './controllers/ProductsController';

const routes = express.Router();

const storesController = new StoresController();
const productsControllers = new ProductsController();

routes.post('/stores', storesController.postStore);
routes.delete('/stores', storesController.deleteStore);
routes.get('/stores/all', storesController.getStores);

routes.post('/products', productsControllers.postProduct);
routes.put('/products/:id', productsControllers.updateProduct);
routes.delete('/products', productsControllers.deleteProduct);
routes.get('/products/all', productsControllers.getProducts);



export default routes;