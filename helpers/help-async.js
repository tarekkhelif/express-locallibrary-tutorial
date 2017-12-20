/** 
 * (Behaves like async.parallel does when passed an object)
 * Takes an object that has promises as the values of its attributes. 
 * Evaluates the promises in parallel and resolves to an object with the same 
 * attributes as the original ovject, now with the value of the resolved 
 * promises.
 */
function evaluate_promises_wrapped_in_object (objectOfPromises) {
    const keys = Object.keys(objectOfPromises);
    const promises = keys.map(key => objectOfPromises[key]);

    const wrappedPromises = Promise.all(promises)
        .then(results => objectFromArrays(keys, results));
    
    return wrappedPromises;
}

/* 
 * Creates an object from an array of keys and an array of values, each of 
 * the same length. 
 */
function objectFromArrays(keys, values) {
    if (keys.length !== values.length) {
        throw new Error("keys and values must be the same length.");
    }

    let obj = {};
    keys.forEach( (key, i) => obj[key] = values[i] );
    return obj;
}

exports.evaluate_promises_wrapped_in_object = evaluate_promises_wrapped_in_object;


// TESTS
let keys = ["flam", "blu", "slee", "dunfom"];
let values = [4, 3, 5, 7];

const jam = objectFromArrays(keys, values);
jam;

const sam = Object.keys(jam);
sam

keys.push("gree");
// const lam = objectFromArrays(keys, values);
