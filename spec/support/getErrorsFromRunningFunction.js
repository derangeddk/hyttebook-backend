module.exports = async (runnable) => { 
    let actualError = null;
    try {
        await runnable();
    } catch(error) {
        actualError = error;
    }
    return actualError;
}