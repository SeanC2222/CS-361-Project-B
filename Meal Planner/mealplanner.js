
// Ben: need to bind ajax response to Java function that persists meal plans
//  and add ui capability somewhere to load meal plans through a second Java function


/* This JSON object will ultimately contain all the information for each recipe
returned by the initial recipes/mealplans/generate call. These will be appended
to finalRecipes[i]. Successive calls to different portions of the Spoonacular API
will add information as follows:
1. GET Compute Daily Meal Plan <recipes/mealplans/generate>
   obtains - id, title
2. GET Recipe Information <recipes/{id}/information> 
   obtains - sourceUrl (of outside website), servings, extendedIngredients,
   readyInMinutes, and meal image url, 
3. GET Extract Recipe From Website <recipes/extract> 
   obtains - text, instructions
Once all these things have been appended, we have a finalized recipeObject
that will be references as finalRecipes[i].
*/
var finalRecipes = [];
/* All the data needed for a single recipe will be gathered into this object:
    id, title, */
var recipeObject = {};
 
/** Function written by: Chris Ferdinandi 3/2/2015
 *  Sourced From: http://gomakethings.com/how-to-get-the-value-of-a-querystring-with-native-javascript/
 *
 *  Use: Will parse a url for "get" queries. Pass 'field' that you want, 'url' is optional
 **/
var getQueryString = function ( field, url ) {
    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
};


/* Spoonacular API Documentation at:
     https://market.mashape.com/spoonacular/recipe-food-nutrition#find-by-nutrients */
/* https://spoonacular-recipe-food-nutrition-v1.p.mashape.com */
/*
   Production Key: bOmaZvaeU8mshuqpe8f0WkZqUCGMp1mxhsnjsnDvVjriaCBS6D 
   Testing Key: DW9XSMsmJ9mshOb8Nu0OUsVY9ry7p1jwSaSjsnB20ChBTkFVg1
*/
var user = "ben2016"; // not used
var key = "DW9XSMsmJ9mshOb8Nu0OUsVY9ry7p1jwSaSjsnB20ChBTkFVg1";


function getWeeklyMeals() {
    var req = new XMLHttpRequest();
    var reqData = {};
    /**Get reqData parts here 
     * Each data part is per INDIVIDUAL meal
     **/

    // Ben: swap comments on reqData['targetCalories'] assignment 
    //   to deal with GET request from calorieCalculator.js
    
    // reqData['targetCalories'] = getQueryString('tdee');
    //reqData['targetCalories'] = 2000;
    //reqData['timeFrame'] = "week";
    
    var reqQuery = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/mealplans/generate?"
    //var reqDataKeys = Object.keys(reqData);
    reqQuery += "targetCalories=" + 2000;
    //reqQuery += "targetCalories=" + getQueryString('tdee');
    reqQuery += "&timeFrame=week";
    
    /*
    for(var i = 0; i < reqDataKeys.length; i++){
        reqQuery += reqDataKeys[i] + "=" + reqData[reqDataKeys[i]];
        if(i != reqData.length-1 ){
            reqQuery += "&";
        }
    }
    */
    
    //Open and send query
    req.open("GET", reqQuery , true);
    req.setRequestHeader("X-Mashape-Key", key);
    req.addEventListener('load', function(){
        var reqCount = 0;
        var failure = 0;
        /**
         * Do something here with the req.responseText
         */
         if (req.status >= 500){
            //Ensure only 8 requests are made at most
            if(++reqCount >= 8) {
                failure = 1;
                console.log("Sorry, we couldn't get a recipe.\n");
                return;
            }
            req.open("GET", reqQuery , true);
            req.setRequestHeader("X-Mashape-Key", key);
            req.send();
         } else {
            var meals = JSON.parse(req.responseText);
            var content = document.getElementById("content");
            
            // 1. GET Compute Daily Meal Plan <recipes/mealplans/generate>
            // obtains - id, title, imageType, imageUrls
            for(var i = 0; i < meals['items'].length; i++){
                var curMeal = meals['items'][i];
                curMeal = JSON.parse(curMeal.value);
                recipeObject.id = curMeal.id;
                recipeObject.title = curMeal.title;
                finalRecipes.push(recipeObject);
            }
         }
    });
    req.send();

}


// Accepts a recipeObject that must contain at least the property id:number
function assignUrlsAndNutrients(recipeObject){
    var reqQuery = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/"
        + recipeObject.id
        + "/information";
    var req = new XMLHttpRequest();
    //Open and send query
    req.open("GET", reqQuery , true);
    req.setRequestHeader("X-Mashape-Key", key);
    
    req.addEventListener('load', function(){
        var reqCount = 0;
        var failure = 0;
        /**
         * Do something here with the req.responseText
         */
         if (req.status >= 500){
            //Ensure only 8 requests are made at most
            if(++reqCount >= 8) {
                failure = 1;
                console.log("assignUrl: Unable to get recipe urls and nutrients from meal id.\n");
                return;
            }
            req.open("GET", reqQuery , true);
            req.setRequestHeader("X-Mashape-Key", key);
            req.send();
         } else {
          
            var response = JSON.parse(req.responseText);
            // parse response here
            recipeObject.sourceUrl = response.sourceUrl;
            recipeObject.servings = response.servings;
            recipeObject.extendedIngredients = response.extendedIngredients;
            recipeObject.readyInMinutes = response.readyInMinutes;
            recipeObject.imageUrl = response.image;
         }
    });
}


/* IMPLEMENT */
// 3. GET Extract Recipe From Website <recipes/extract> 
//    obtains - servings, extendedIngredients, readyInMinutes, text, instructions
function assignRecipeInstructions(recipeObject){}


function createRecipes(){
    // call all the ajax functions in series
    getWeeklyMeals();
    for (var x = 0; x < finalRecipes.length; ++x){
        assignUrlsAndNutrients(finalRecipes[x]);
        assignRecipeInstructions(finalRecipes[x]);
    }
}

function createMealDivs(){
    var newDiv = document.createElement("div");
    newDiv.id = "content";
    // create more html here based on finalRecipes[]
    // Ben: for JQuery mobile css, some edits needed here
    //newDiv.innerHTML = JSON.stringify(curMeal);
    //content.appendChild(newDiv);
}

createRecipes();