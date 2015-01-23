Stripe.setPublishableKey('pk_test_zrK5MavDaUy6QnFISqrWfxT8');


var card = new Card({
	form: 'form',
	container: '.card'
});

var defaultCard = "5555555555554444";
var defaultCVC = "123";
var defaultExp = "10/18";

$('#card-number').val(defaultCard);
$('#card-cvc').val(defaultCVC);
$('#card-expire').val(defaultExp);

$('#buy').click(function(){
	var cardNumber = $('#card-number').val();
	var cvc = $('#card-cvc').val();
	var exp = $("#card-expire").val().split('/');
	var expMonth = parseInt(exp[0]);
	var expYear = parseInt(exp[1]);

	var tokenObj = {
		number: cardNumber,
		cvc: cvc,	
		exp_month: expMonth,
		exp_year: expYear
	};
	
	try{	
		validateTokenObj(tokenObj);
	} catch(e){
		return console.log(e.stack);
	}

	Stripe.card.createToken(tokenObj,
		function(status, response){
			console.log(status);
			console.log(response);
			var token = response.id;
			var data = {
				appName: 'pickit',
				product: 'test',
				token: token
			};

			$.ajax({
				url:'http://localhost:5000/charge',
				type:"POST",
				data:JSON.stringify(data),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				success: function(res){
					console.log(res);
				}
			})
			
	});
});

validateTokenObj = function(obj){
	if(! Stripe.card.validateCardNumber(obj.number)){
		throw new Error('Invalid Card Number');
	}
	if(! Stripe.card.validateExpiry(obj.exp_month, obj.exp_year)){
		throw new Error('Invalid Expiry Date');
	}
	if(! Stripe.card.validateCVC(obj.cvc)){
		throw new Error('Invalid CVC');
	}
};
