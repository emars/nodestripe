//SIMPLE STRIPE PAYMENT SERVER
var fs = require('fs');

var express = require('express');
var bodyParser = require('body-parser');
var mkdirp = require('mkdirp');
var cors = require('cors');

//Read Stripe secret key from second argument or default to key.txt
var keyFile = process.argv[2] || 'key.txt';

try {
	//Parse Key File removing newline if added
	var key = fs.readFileSync(keyFile).toString().replace('\n','');
} catch(e){
	throw e;
}

var stripe = require('stripe')(key);

//Create Config section in home directory ~/.nodestripe
var HOME = process.env.HOME;

if(! fs.existsSync(HOME + '/.nodestripe')){
	mkdirp.sync(HOME + '/.nodestripe');
	fs.writeFileSync(HOME + '/.nodestripe/config.json','');
}

var config = JSON.parse(fs.readFileSync(HOME + '/.nodestripe/config.json'));

var app = express();

//Enable reading of JSON requests
app.use(bodyParser.json()); 
//Enable Cross Origin Resourse Sharing
app.use(cors());

//Get list of products
app.get('/products', function(req, res){
	res.json(config.products);
});

//Create a new customer
app.post('/customer', function(req, res){
	var product = req.body.product;
	var stripeToken = req.body.token;
	if(! product || ! stripeToken){
		return res.send(401);
	}

	var customer = {
		card: stripeToken,
		description:'test description'
	};

	stripe.customers.create(customer)
		.then(function(customer){
			res.send(201);
		}, function(err){
			handleError(err,res);
		});
});

//Charge a card
app.post('/charge', function(req, res){
	var product = req.body.product;
	var stripeToken = req.body.token;
	var charge;

	try{
		charge = generateCharge(appName, product);
	} catch(e){
		return res.send(e);
	}

	charge.card= stripeToken;

	stripe.charges.create(charge)
		.then(function(charge){
			res.json(charge);
		}, function(err){
			handleError(err, res);
	});
});

app.get('*', function(req, res){
	res.send(404);
});

app.listen(5000, function(req, res){
	console.log('Simple Stripe Server listening on port 5000');
});

var handleError = function(err,res){
	switch (err.type) {
		case 'StripeCardError':
			// A declined card error
			err.message; // => e.g. "Your card's expiration year is invalid."
			break;
		case 'StripeInvalidRequestError':
			// Invalid parameters were supplied to Stripe's API
			break;
		case 'StripeAPIError':
			// An error occurred internally with Stripe's API
			console.log(err.message);
			break;
		case 'StripeConnectionError':
			// Some kind of error occurred during the HTTPS communication
			break;
		case 'StripeAuthenticationError':
			// You probably used an incorrect API key
			break;
		default:
			res.send(500);
	}		
}

var generateCharge = function(appName, productName){
	var products = config[appName].products;
	var productToCharge;
	for(var i = 0; i < products.length; i++){
		if(products[i].name === productName){
			productToCharge = products[i];	
			break;
		}
	}
	if(productToCharge === undefined){
		throw new Error('Product not found');
	}
	var obj = {
		currency: productToCharge.currency,
		description: productToCharge.description,
		amount: productToCharge.amount
	};	
	return obj;
};