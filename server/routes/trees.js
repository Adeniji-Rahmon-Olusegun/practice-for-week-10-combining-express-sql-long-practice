// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

/**
 * BASIC PHASE 2, Step A - Instantiate SQLite and database
 *   - Database file: "data_source" environment variable
 *   - Database permissions: read/write records in tables
 */
// Your code here
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(
    process.env.DATA_SOURCE,
    sqlite3.OPEN_READWRITE
);



/**
 * BASIC PHASE 2, Step B - List of all trees in the database
 *
 * Protocol: GET
 * Path: /
 * Parameters: None
 * Response: JSON array of objects
 *   - Object properties: height-ft, tree, id
 *   - Ordered by the height_ft from tallest to shortest
 */
// Your code here
router.get('/', (req, res, next) => {
    const params = [];
    const sql = `SELECT id, tree FROM trees`;

    db.all(sql, params, (err, rows) => {
        res.json(rows)
    });
});


/**
 * BASIC PHASE 3 - Retrieve one tree with the matching id
 *
 * Path: /:id
 * Protocol: GET
 * Parameter: id
 * Response: JSON Object
 *   - Properties: id, tree, location, height_ft, ground_circumference_ft
 */
// Your code here
router.get('/:id', (req, res, next) => {
    const params = [req.params.id];
    const sql = `SELECT * FROM trees WHERE id = ?`;

    db.get(sql, params, (err, row) => {
        if (!err) {
            res.json(row);
        } else {
            next(err);
        }
    });
});

/**
 * INTERMEDIATE PHASE 4 - INSERT tree row into the database
 *
 * Path: /trees
 * Protocol: POST
 * Parameters: None
 * Response: JSON Object
 *   - Property: message
 *   - Value: success
 */
// Your code here

router.post('/', (req, res, next) => {
    const {name, location, height, size} = req.body;
    const params = [name, location, height, size];

    const sql = `
                INSERT INTO trees (tree, location, height_ft, ground_circumference_ft)
                VALUES (?, ?, ?, ?)
                `;
    const sql_last = 'SELECT * FROM trees ORDER BY id DESC LIMIT 1';

    db.run(sql, params, (err) => {
        if (!err) {
            db.get(sql_last, [], (err, row) => {
                res.json({
                    message: "Sucessfully added",
                    data: row
                });
            });
        } else {
            next(err);
        }
    });
});
/**
 * INTERMEDIATE PHASE 5 - DELETE a tree row from the database
 *
 * Path: /trees/:id
 * Protocol: DELETE
 * Parameter: id
 * Response: JSON Object
 *   - Property: message
 *   - Value: success
 */
// Your code here
router.delete('/:id', (req, res, next) => {
    const params = [req.params.id];
    const sql = 'DELETE FROM trees WHERE id = ?';

    db.run(sql, params, (err) => {
        if (err) {
            next(err);
        } else {
            res.json({
                message: "Successfuly deleted!"
            });
        }
    });
});
/**
 * INTERMEDIATE PHASE 6 - UPDATE a tree row in the database
 *
 * Path: /trees/:id
 * Protocol: PUT
 * Parameter: id
 * Response: JSON Object
 *   - Property: message
 *   - Value: success
 */
// Your code here
router.put('/:id', (req, res, next) =>{
    const { id } = req.params;

    const params = [id];
    const sql = `SELECT EXISTS(SELECT tree FROM trees WHERE id = ?)`;

    db.get(sql, params, (err, row) => {
        if (Object.values(row)[0] === 0) {
            res.json({"error": "ids doesn't match"});
        } else {
            const {id, name, location, height, size } = req.body;

            const params = [id, name, location, height, size, id];

            const sql = `
                        UPDATE trees 
                        SET id = ?,
                        tree = ?, 
                        location = ?,
                        height_ft = ?, 
                        ground_circumference_ft = ?
                        WHERE id = ?
                        `;
            
            db.run(sql, params, (err) => {
                res.json({
                    message: "success"
                });
            })
        }
    });
})

// Export class - DO NOT MODIFY
module.exports = router;