const Product = require("../models/product");
const Order = require("../models/order");
const router = require('express').Router();

/**
 * -------------- POST ROUTES ----------------
 */

router.post('/add-product', (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.redirect('/');
    }
    const newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        url: req.body.url,
    });
    newProduct.save((err) => {
        if (err) {
            console.error(err);
        }
        else {
            res.redirect('/products');
        }
    });
});

router.post('/edit-product', function (req, res) {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.redirect('/');
    }
    const prodId = req.body.productId;
    const updatedTitle = req.body.name;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDescription = req.body.description;

    Product.findById(prodId)
        .then(product => {
            product.name = updatedTitle;
            product.price = updatedPrice;
            product.imageUrl = updatedImageUrl;
            product.description = updatedDescription;
            return product.save();
        })
        .then(result => {
            res.redirect('/products');
        })
        .catch(err => console.log(err));
});

router.post('/update-order', function (req, res) {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.redirect('/');
    }

    const deliveryPrices = {
        standard: 2.49,
        fast: 6.99,
        collect: 0
    }
    const orderId = req.body.orderId;
    const prodId = Array.isArray(req.body.prodId) ? [...req.body.prodId] : [req.body.prodId];
    const quantities = prodId.map((_, i) => req.body[`quantity${i}`]);
    const delivery = req.body.delivery;

    Order.findOne({ _id: orderId }).then(order => {
        for (item of order.products) {
            item.quantity = quantities.pop();
        }
        let totalPrice = 0;
        for (item of order.products) {
            totalPrice += item.quantity * item.product.price;
        }
        order.total = totalPrice + deliveryPrices[delivery];
        order.delivery = delivery;
        return order.save();
    });
    return res.redirect('/all-orders');
});

router.post('/delete-order', function (req, res) {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.redirect('/');
    }
    const orderId = req.body.orderId;
    Order.findByIdAndRemove(orderId)
        .then(() => {
            res.redirect('/all-orders');
        })
        .catch(err => console.log(err));
});

router.post('/delete-product', function (req, res) {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.redirect('/');
    }
    const prodId = req.body.productId;
    Product.findByIdAndRemove(prodId)
        .then(() => {
            res.redirect('/products');
        })
        .catch(err => console.log(err));
});

router.post('/delete-order-item/:prodId', function (req, res) {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.redirect('/');
    }
    const orderId = req.body.orderId;
    const prodId = req.params.prodId;

    Order.findOne({ _id: orderId }).then(order => {
        const newProducts = order.products.filter(item => {
            return item.product._id != prodId;
        });
        order.products = newProducts;
        return order.save();
    }).then(result => {
        return res.redirect('/edit-order/' + orderId);
    });
});

/**
 * -------------- GET ROUTES ----------------
 */

router.get("/add-product", function (req, res) {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.redirect('/');
    }
    res.render("admin/add-product", { user: req.user });
});

router.get('/edit-product/:productId', function (req, res) {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    console.log(prodId);
    Product.findById(prodId)
        .then(prod => {
            res.render('admin/edit-product', {
                product: prod, user: req.user
            });
        })
        .catch(err => console.log(err));
});



router.get('/edit-order/:orderId', function (req, res) {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.redirect('/');
    }
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return res.redirect('/');
            }
            res.render('admin/edit-order', {
                order: order, user: req.user
            });
        })
        .catch(err => console.log(err));
});


router.get("/all-orders", (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.redirect('/');
    }
    Order.find()
        .populate('userId')
        .then(orders => {
            filteredOrders = orders.filter(order => order.userId != null);
            res.render('admin/all-orders', {
                orders: filteredOrders, user: req.user
            });
        })
        .catch(err => console.log(err));
});

module.exports = router;