const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const router = require('express').Router();

/* -------------- POST ROUTES ---------------- */

router.post("/delete-cart-item", (req, res) => {
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
    const prodId = req.body.productId;
    console.log(prodId);
    req.user.removeFromCart(prodId).then(user => {
        res.redirect("/shopping-cart");
    });
});

router.post("/cart", (req, res) => {
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
    const prodId = req.body.productId;
    const quantity = parseInt(req.body.amount);

    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product, quantity);
        })
        .then(result => {
            res.redirect('/products');
        });
});

router.post("/checkout", (req, res) => {
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
    User.findById(req.user.id)
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(item => {
                return { quantity: item.quantity, product: { ...item.productId.toJSON() } };
            });
            const order = new Order({
                products: products,
                userId: req.user,
                total: req.body.finalPrice,
                delivery: req.body["delivery-method"]
            });
            return order.save();
        }).then(result => {
            return req.user.clearCart();
        })
        .then(result => {
            res.redirect('/');
        })
        .catch(err => console.log(err));
});

/* -------------- GET ROUTES ---------------- */

router.get("/products", (req, res) => {
    Product.find()
        .then(products => {
            res.render("products", { products: products, user: req.user });
        })
        .catch(err => {
            console.log(err);
        });
});

router.get('/shopping-cart', (req, res) => {
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
    User.findById(req.user.id)
        .populate('cart.items.productId')
        .then((user) => {
            const products = user.cart.items.map((i) => {
                return { quantity: i.quantity, product: { ...i.productId.toJSON() } };
            });

            let totalPrice = 0;
            let totalAmount = 0;
            for (p of products) {
                totalPrice += p.quantity * p.product.price;
                totalAmount += p.quantity;
            }
            res.render('shopping-cart', {
                cartProducts: products,
                user: req.user,
                totalPrice: totalPrice,
                totalAmount: totalAmount
            });
        });
});

router.get("/my-orders", (req, res) => {
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
    Order.find({ userId: req.user.id })
    .populate('userId')
        .then(orders => {
            console.log(orders);
            res.render('user-orders', {
                orders: orders, user: req.user
            });
        })
        .catch(err => console.log(err));
});

module.exports = router;