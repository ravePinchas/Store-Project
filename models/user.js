const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    firstName: String,
    lastName: String,
    password: String,
    role: String,
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: { type: Number, required: true },
            },
        ],
    },
});

userSchema.methods.removeFromCart = function (prodId) {
    const updatedCartItems = this.cart.items.filter((product) => {
        return product.productId.toString() != prodId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.addToCart = function (product, quantity = 1) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
        return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = quantity;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
        newQuantity += this.cart.items[cartProductIndex].quantity;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity,
        });
    }
    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.clearCart = function() {
    this.cart.items = [];
    return this.save();
};

userSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', userSchema);
