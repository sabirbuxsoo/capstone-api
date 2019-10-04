//Authors: Sabir Buxsoo, Daniel Vorster, Sheldon Reay
const mysql = require('mysql');

//This file contains all the MySQL Queries for the API

//Update this with your MySQL Credentials
const pool = mysql.createPool({
    connectionLimit: 1000,
    password: 'passwordformysql',
    user: 'username',
    database: 'inform',
    host: 'localhost',
    port: '3306',
    dateStrings: true
});

let chirprdb = {};

//Get list of users from database
chirprdb.all = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * from users`, (err, results) => {
            if(err){
                return reject(err);
            }
            return resolve(results);
        });
    });
};

//Get specific user
chirprdb.one = (userId) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * from users WHERE id= ?`, userId, (err, results) => {
            if(err){
                return reject(err);
            }
            return resolve(results[0]);
        });
    });
};

//Delete Specific User
chirprdb.del = (userId) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE from users WHERE id= ?`, userId, (err, results) => {
            if(err){
                return reject(err);
            }
            return resolve("User Deleted Successfully");
        });
    });
};

//Register User
chirprdb.addUser = (userInfo) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT COUNT(*) AS cnt from users where  email = ?`,  userInfo.email, (err, results) => {
            if(err){
                return reject(err);
            }else{
                if(results[0].cnt > 0){
                    let responseJson = {"message": "User already exists", "registered": false}
                    return resolve(responseJson);
                }else{
                    pool.query(`INSERT INTO users(first_name, last_name, email, password) VALUES (?,?,?,?)`, [userInfo.firstName, "" ,userInfo.email, userInfo.password], (err, results) => {
                        if(err){
                            return reject(err);
                        }
                        let responseJson = {"message": "User registered successfully", "registered": true}
                        return resolve(responseJson);
                    });
                }
            }
        });
    });
};


//Login User
chirprdb.login = (userInfo) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT id,password, user_permission from users where  email = ?`,  userInfo.email, (err, results) => {
            if(err){
                return reject(err);
            }else{
                if(results.length > 0){
                    if(results[0].password === userInfo.password){
                        let responseJson = {"message": "Login Successful", "loggedIn": true, "userID": results[0].id, "user_permission": results[0].user_permission}
                        return resolve(responseJson);
                    }
                    let responseJson = {"message": "Password is wrong. Please try again", "loggedIn": false}
                    return resolve(responseJson);
                }else{
                    let responseJson = {"message": "User does not exist", "loggedIn": false}
                    return resolve(responseJson);
                }
            }
        });
    });
};


//Get All Posts for user preferred location
chirprdb.allPosts = (userData) => {
    let x = [];
    let cntr = 0;
    return new Promise((resolve, reject) => {
        for (let i = 0; i < userData.locations.length; i++) {
            let location = userData.locations[i];
            pool.query('SELECT posts.date_posted, posts.photo_uri, posts.post_id, posts.title, posts.description, locations.location_name, locations.location_id, users.id AS user_id, CONCAT(users.first_name, " ", users.last_name) as name FROM posts_locations INNER JOIN posts on posts.post_id = posts_locations.post_id INNER JOIN locations on locations.location_id = posts_locations.location_id INNER JOIN users on posts.user_id = users.id WHERE posts_locations.location_id = ? ORDER BY posts.date_posted DESC', location.location_id, (err, results) => {
                if(err){
                    return reject(err);
                }
                ++cntr;
                x[i] = results;
                // if all queries done now
                if (cntr === userData.locations.length) {
                    resolve(x.flat());
                }
            });
        }
    });
};

//Fetch all posts
chirprdb.fetchAllPosts = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT posts.date_posted, posts.post_id, posts.title, posts.description, locations.location_name, CONCAT( users.first_name, " ", users.last_name ) AS name, EXISTS( SELECT 1 FROM posts_flags pf WHERE pf.post_id = posts.post_id ) flagged FROM posts INNER JOIN posts_locations ON posts.post_id = posts_locations.post_id INNER JOIN locations ON locations.location_id = posts_locations.location_id INNER JOIN users ON posts.user_id = users.id`, (err, results) => {
            if(err){
                return reject(err);
            }
            return resolve(results);
        });
    });
};

//Get single post based on id
chirprdb.onePost = (postId) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT posts.date_posted, posts.post_id, posts.title, posts.description, locations.location_name, CONCAT(users.first_name, " ", users.last_name) as name FROM posts 
        INNER JOIN posts_locations on posts.post_id = posts_locations.post_id INNER JOIN locations on locations.location_id = posts_locations.location_id INNER JOIN users on posts.user_id = users.id WHERE posts.post_id = ?`, postId, (err, results) => {
            if(err){
                return reject(err);
            }
            return resolve(results[0]);
        });
    });
};

//Add post
chirprdb.addPost = (postInfo) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO posts(title, description, user_id, photo_uri) VALUES (?,?, ?,?)`, [postInfo.title, postInfo.description, postInfo.user_id, postInfo.photo_uri], (err, results) => {
            if(err){
                return reject(err);
            }else{
                pool.query(`INSERT INTO posts_locations(post_id, location_id) VALUES (?,?)`, [results.insertId, postInfo.location], (err, results) => {
                    if(err){
                        return reject(err);
                    }
                    let responseJson = {"message": "Post added successfully", "postAdded": true}
                return resolve(responseJson);
                });     
            }
        });
    });
};

//Add Locations
chirprdb.setLocations = (postInfo) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE from users_locations WHERE user_id = ?`, postInfo.id, (err, results) => {
            if(err){
                return reject(err);
            }
            postInfo.locations.forEach((location)=>{
                pool.query(`INSERT INTO users_locations(user_id, location_id) VALUES (?,?)`, [postInfo.id, location], (err, results) => {
                    if(err){
                        return reject(err);
                    }
                });
            });
            let responseJson = {"message": "Locations added successfully"}
            return resolve(responseJson);   
        });

             
    });
};



//Delete Post
chirprdb.delPost = (delData) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE from posts WHERE post_id= ? AND user_id = ?`, [delData.post_id, delData.user_id], (err, results) => {
            if(err){
                return reject(err);
            }
            pool.query(`DELETE from posts_locations WHERE post_id= ?`, delData.post_id, (err, results) => {
                if(err){
                    return reject(err);
                }
            });
            let responseJson = {"message": "Post deleted successfully", "postDeleted": true}
            return resolve(responseJson);
        });
    });
};

//Admin Delete post
chirprdb.delPostAdmin = (delData) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE from posts WHERE post_id= ? `, delData.post_id, (err, results) => {
            if(err){
                return reject(err);
            }
            pool.query(`DELETE from posts_locations WHERE post_id= ?`, delData.post_id, (err, results) => {
                if(err){
                    return reject(err);
                }
                pool.query(`DELETE from posts_flags WHERE post_id= ?`, delData.post_id, (err, results) => {
                    if(err){
                        return reject(err);
                    }
                });
                let responseJson = {"message": "Post deleted successfully", "postDeleted": true}
                return resolve(responseJson);
            });
            
        });
    });
};


//Get all locations
chirprdb.allLocations = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * from locations ORDER BY location_name ASC`, (err, results) => {
            if(err){
                return reject(err);
            }
            return resolve(results);
        });
    });
};

//Unflag post
chirprdb.unflagPost = (delData) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE from posts_flags WHERE post_id= ?`, delData.post_id, (err, results) => {
            if(err){
                return reject(err);
            }
            let responseJson = {"message": "Post unflagged successfully", "postUnflagged": true}
            return resolve(responseJson);
        });
    });
};


//Get Post Count
chirprdb.postCount = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT COUNT(post_id) as numPosts from posts`, (err, results) => {
            if(err){
                return reject(err);
            }
            return resolve(results[0]);
        });
    });
};


// SELECT `locations`.`location_id`, `locations`.`location_name` FROM `users_locations` 
// INNER JOIN `locations` ON `locations`.`location_id` = `users_locations`.`location_id`  
// WHERE `users_locations`.`user_id` = 93

//Get user specified locations
chirprdb.userLocations = (userData) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT locations.location_id, locations.location_name FROM users_locations INNER JOIN locations ON locations.location_id = users_locations.location_id WHERE users_locations.user_id = ?`, userData.id, (err, results) => {
            if(err){
                return reject(err);
            }
            return resolve(results);
        });
    });
};


//Flag Post
chirprdb.flagPost = (postInfo) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO posts_flags(user_id, post_id) VALUES (?,?)`, [postInfo.user_id, postInfo.post_id], (err, results) => {
            if(err){
                return reject(err);
            }
            let responseJson = {"message": "Post flagged!", "postFlagged": true}
            return resolve(results)

        });
    });
};


//Get All events for user preferred location
chirprdb.allEvents = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT event_id, visible, event_name, date_posted, event_location, event_start, event_end, author_id, event_description, locations.location_name, CONCAT(users.first_name, " ", users.last_name) as author_name FROM events INNER JOIN locations on locations.location_id = events.event_location INNER JOIN users on users.id = events.author_id ORDER BY events.date_posted DESC', (err, results) => {
            if(err){
                return reject(err);
            }
            return resolve(results)
        });
    });
};

//Add an event
chirprdb.addEvent = (eventsInfo) => {
    let date_posted = new Date().toISOString().slice(0, 19).replace('T', ' ');

    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO events(event_name, date_posted, event_start, event_end, event_location, author_id, event_description, photo_uri, event_address) VALUES (?,?,?,?,?,?,?,?,?)`, [eventsInfo.event_name, date_posted, eventsInfo.event_start, eventsInfo.event_end, eventsInfo.event_location, eventsInfo.user_id, eventsInfo.event_description, eventsInfo.photo_uri, eventsInfo.event_address], (err, results) => {
            if(err){
                return reject(err);
            }
            let responseJson = {"message": "Event added successfully", "eventAdded": true}
            return resolve(responseJson);
        });
    });
};


//SELECT COUNT(post_id), DATE(date_posted) FROM posts WHERE MONTH(date_posted) = MONTH(NOW())  GROUP BY DATE(posts.date_posted)
//Get all posts for current month and store in array
//Used for charts

chirprdb.monthPosts = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT COUNT(post_id) as num_posts, DATE(date_posted) as date FROM posts WHERE MONTH(date_posted) = MONTH(NOW()) GROUP BY DATE(posts.date_posted)', (err, results) => {
            if(err){
                return reject(err);
            }
            let date = new Date();
            let month = date.getMonth();
            date.setDate(1);
            let all_days = [];

            while (date.getMonth() === month) {
                let datemonth = date.getMonth() + 1;
                let d =
                  date.getFullYear() +
                  '-' +
                  datemonth.toString().padStart(2, '0') +
                  '-' +
                  date
                    .getDate()
                    .toString()
                    .padStart(2, '0');
      
                all_days.push(d);
                date.setDate(date.getDate() + 1);
              }

              let all_posts = new Array(all_days.length).fill(0);

              for(let i = 0; i <= all_posts.length; i++){
                  results.forEach(result => {
                      let dateStr = result["date"]
                      let getNum = parseInt(dateStr.split("-")[2], 10) - 1
                        if(getNum === i){
                            all_posts[i] = result.num_posts;
                        }
                  })
              }


            return resolve(all_posts)
        });
    });
};

//Get all Events for User Selected Locations
chirprdb.allUserEvents = (userData) => {
    let x = [];
    let cntr = 0;
    return new Promise((resolve, reject) => {
        for (let i = 0; i < userData.locations.length; i++) {
            let location = userData.locations[i];
            pool.query('SELECT event_id, visible, event_name, date_posted, event_location, event_start, event_end, author_id, event_description, photo_uri, locations.location_name, CONCAT(users.first_name, " ", users.last_name) as author_name FROM events INNER JOIN locations on locations.location_id = events.event_location INNER JOIN users on users.id = events.author_id WHERE event_location = ? AND events.visible = ? ORDER BY events.date_posted DESC', [location.location_id, 1], (err, results) => {
                if(err){
                    return reject(err);
                }
                ++cntr;
                x[i] = results;
                // if all queries done now
                if (cntr === userData.locations.length) {
                    resolve(x.flat());
                }
            });
        }
    });
};

//Delete event
chirprdb.delEvent = (eventData) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE from events WHERE event_id= ? AND author_id = ?`, [eventData.event_id, eventData.user_id], (err, results) => {
            if(err){
                return reject(err);
            }
            return resolve("User Deleted Successfully");
        });
    });
};

//Delete event from Dashboard Admin
chirprdb.delEventAdmin = (eventData) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE from events WHERE event_id= ?`, eventData.event_id, (err, results) => {
            if(err){
                return reject(err);
            }
            return resolve("Event deleted Successfully");
        });
    });
};


//RSVP to event
chirprdb.rsvp = (rsvpInfo) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO event_attendees(user_id, event_id) VALUES (?,?)`, [rsvpInfo.user_id, rsvpInfo.event_id], (err, results) => {
            if(err){
                return reject(err);
            }
            let responseJson = {"message": "You have successfully Rsvped to the event", "rsvp": true}
            return resolve(responseJson);
        });
    });
};

//Unrsvp from event
chirprdb.unrsvp = (rsvpInfo) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM event_attendees WHERE user_id = ? AND  event_id = ?`, [rsvpInfo.user_id, rsvpInfo.event_id], (err, results) => {
            if(err){
                return reject(err);
            }
            let responseJson = {"message": "You have successfully Rsvped to the event", "rsvp": true}
            return resolve(responseJson);
        });
    });
};

//Check all attending
chirprdb.isAttending = (rsvpInfo) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT user_id FROM event_attendees WHERE user_id = ? AND event_id = ?`, [rsvpInfo.user_id, rsvpInfo.event_id], (err, results) => {
            if(err){
                return reject(err);
            }
            if(results.length > 0){
                let responseJson = {"attending": true}
                return resolve(responseJson);
            }else{
                let responseJson = {"attending": false}
                return resolve(responseJson);
            }
            
        });
    });
};

//List of attendees
chirprdb.attendees = (eventInfo) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT user_id FROM events_attendees WHERE user_id = ? AND event_id = ?`, [rsvpInfo.user_id, rsvpInfo.event_id], (err, results) => {
            if(err){
                return reject(err);
            }
            if(results.length > 0){
                let responseJson = {attending: true}
                return resolve(responseJson);
            }else{
                let responseJson = {attending: false}
                return resolve(responseJson);
            }
            
        });
    });
};


//Month Users for line graph
chirprdb.monthUsers = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT COUNT(id) as num_users, DATE(date_joined) as date FROM users WHERE MONTH(date_joined) = MONTH(NOW()) GROUP BY DATE(users.date_joined)', (err, results) => {
            if(err){
                return reject(err);
            }
            let date = new Date();
            let month = date.getMonth();
            date.setDate(1);
            let all_days = [];

            while (date.getMonth() === month) {
                let datemonth = date.getMonth() + 1;
                let d =
                  date.getFullYear() +
                  '-' +
                  datemonth.toString().padStart(2, '0') +
                  '-' +
                  date
                    .getDate()
                    .toString()
                    .padStart(2, '0');
      
                all_days.push(d);
                date.setDate(date.getDate() + 1);
              }

              let all_posts = new Array(all_days.length).fill(0);

              for(let i = 0; i <= all_posts.length; i++){
                  results.forEach(result => {
                      let dateStr = result["date"]
                      let getNum = parseInt(dateStr.split("-")[2], 10) - 1
                        if(getNum === i){
                            all_posts[i] = result.num_users;
                        }
                  })
              }


            return resolve(all_posts)
        });
    });
};

//Approve Event for admin dashboard
chirprdb.approveEvent = (eventInfo) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE events SET visible = ? WHERE event_id = ?`, [1, eventInfo.event_id], (err, results) => {
            if(err){
                return reject(err);
            }
            let responseJson = {"message": "You have successfully approved  the event", "approved": true}
            return resolve(responseJson);
        });
    });
};

//Unapprove event from admin dashboard
chirprdb.unapproveEvent = (eventInfo) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE events SET visible = ? WHERE event_id = ?`, [0, eventInfo.event_id], (err, results) => {
            if(err){
                return reject(err);
            }
            let responseJson = {"message": "You have successfully unapproved the event", "unapproved": true}
            return resolve(responseJson);
        });
    });
};

//Flagged / Unflagged posts pie data
chirprdb.pieData = () => {
    let shelly = new Object();

    return new Promise((resolve, reject) => {
        pool.query(`SELECT COUNT(posts.post_id) as flagCount, EXISTS( SELECT 1 FROM posts_flags pf WHERE pf.post_id = posts.post_id ) flagged FROM posts GROUP BY flagged`, (err, results) => {
            if(err){
                return reject(err);
            }

            if(results.length === 1){
                if(results[0].flagged === 1){
                    results.push({"flagCount": 0, "flagged" : 0})
                }

                if(results[0].flagged === 0){
                    results.push({"flagCount": 0, "flagged" : 0})
                }

                
            }

            return resolve([results[0].flagCount, results[1].flagCount])
            
        });
    });
};

module.exports = chirprdb;
/*
Codes
sc1001 = user exists
sc1002 = user added
sc2001 = correct pass
sc2002 = incorrect pass 
sc2003 = no such user 
TRASH CODE
*/
