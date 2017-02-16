
/// simple synchronous function which determines if a user has the rights to modify an event
module.exports = (serverDocument, eventDocument, userDocument) => {
    let userID = userDocument._id;
    if(userID===eventDocument._author) {
        return true;
    } else {
        for(let i=0; i<serverDocument.config.admins.length; i++) {
            if(serverDocument.config.admins[i]._id===userID) {
                return true;
            }
        }
    }
    return false;
};