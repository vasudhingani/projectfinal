const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const port = process.env.port || 8080;
const app = express();
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(session({
  secret: '$2b$04$qEIOs7SmG8ORHvhi2Xzk4.',
  name: 'PHPSESSID',
  resave: true,
  saveUninitialized: true,
  rolling: true
}));

const GLOBAL_SALT = '$2b$04$0C1ZMs9dTo80pglNyFweNO';

app.use('/', express.static('frontend'));

const router = express.Router();
app.use('/api', router);

const db = mysql.createConnection({
    host: '35.193.158.162',
    user: 'root',
    password: 'mew',
    database: 'db3'
  });

const initDB = function() {
  return new Promise((resolve, reject) => {
    db.connect(err => {
      if (err) {
        console.error('Unable to connect to database.', err);
        console.error('Retrying in 5s.');
        setTimeout(() => initDB().then(resolve), 5000);
      } else {
        console.log('Connected to mysql!');
        resolve();
      }
    });
  });
};

const query = function(str, ...params) {
  return new Promise((resolve, reject) => {
    db.query(str, params, (error, results, fields) => {
      if (error) {
        reject(error);
        console.error({
          invocation: [str, ...params],
          error
        });
      } else {
        resolve(results);
      }
    });
  });
};

const assertSchema = function(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (actual[key] === null || typeof value == 'string' && typeof actual[key] != value) {
      return false;
    }
    if (typeof value == 'object' && (typeof actual[key] != 'object' || !assertSchema(actual[key], value))) {
      return false;
    }
  }
  return true;
};

const accountExists = async function(ID_Number) {
  const records = await query('SELECT * FROM employees WHERE ID_Number=?', ID_Number);
  return !!records.length;
};

const isManager = async function(ID_Number) {
  if (!ID_Number) {
    return false;
  }
  const records = await query('SELECT * FROM employees WHERE Title = "MA" and ID_Number=?', ID_Number);
  return !!records.length;
};


const getAccountRoles = async function(ID_Number) {
  return {
    isManager: await isManager(ID_Number)
  };
};

router.post('/login', async (req, res) => {
  console.log(req.body);
  if (!assertSchema(req.body, {
        username: 'number',
        password: 'string'
      })) {
    res.status(400).send('Bad Request');
    return;
  }
  const { username, password } = req.body;
  const expected = (await query('SELECT * FROM employees WHERE ID_Number=?', username))[0] || {};
  const actualHash = await bcrypt.hash(password, GLOBAL_SALT);
  if (expected && expected.password == actualHash) {
    req.session.identity = username;
    res.json({
      success: true,
      ...(await getAccountRoles(username))
    });
  } else {
    res.json({
      success: false,
      message:  'Incorrect username or password.'
    });
  }
});


//add cars
router.post('/addParking', async (req,res) => {
  console.log(req.body);
  if (!assertSchema(req.body, {
    Ticket_Number: 'string',
    Description: 'string',
    Room_Number: 'string'
   
   
  })) {
    res.status(400).send('Bad Request!!');
    return;
  }
  const{
    Ticket_Number,
    Description,
    Room_Number
  }=req.body;
  
  
  try {
    await query(`INSERT INTO
      cars (Ticket_Number, Description, Room_Number)
      VALUE (?, ?, ?);`,
      Ticket_Number, Description, Room_Number);
      
    console.log(`add guest ${Ticket_Number}.`);
    req.session.identity = Ticket_Number;
    res.json({
      success: true
    });
  } catch (err) {
    console.error(`Error while creating account.`, req.body, err);
    res.status(500).send('Server Error');
  }

});
//end of add cars



router.post('/add-guests', async (req,res) => {
  console.log(req.body);
  if (!assertSchema(req.body, {
    Room_Number: 'string',
    Hotel_ID: 'number',
    LastName: 'string',
    FirstName: 'string',
   
  })) {
    console.log(req.body);
    res.status(400).send('Bad Request');
    return;
  }
  const{
    Room_Number,
    Hotel_ID,
    LastName,
    FirstName
  }=req.body;
  if (await accountExists(Room_Number)) {
    res.json({
      success: false,
      message: 'This Room is Booked with another Guest!'
    });
    return;
  }
  try {
    await query(`INSERT INTO
      guest (Room_Number, Hotel_ID, LastName, FirstName )
      VALUE (?, ?, ?, ?);`,
      Room_Number, Hotel_ID, LastName, FirstName);
    console.log(`add guest ${Room_Number}.`);
    req.session.identity = Room_Number;
    res.json({
      success: true
    });
  } catch (err) {
    console.error(`Error while creating account.`, req.body, err);
    res.status(500).send('Server Error');
  }

});


router.post('/create-account', async (req, res) => {
  console.log(req.body);
  if (!assertSchema(req.body, {
    ID_Number: 'number',
    Managed_BY: 'number',
    Name: 'string',
    address: 'string',
    Phone_Number: 'number',
    Shift: 'string',
    Vale_company: 'number',
    Title: 'string',
    password: 'string'
  })) {
    res.status(400).send('Bad Request');
    return;
  }
  const {
    ID_Number,
    Managed_BY,
    Name,
    address,
    Phone_Number,
    Shift,
    Vale_company,
    Title,
    password
  } = req.body;
  if (await accountExists(ID_Number)) {
    res.json({
      success: false,
      message: 'Please use the login screen to access your account'
    });
    return;
  }
  console.log(password,GLOBAL_SALT);
  passwordHash= bcrypt.hashSync(password,GLOBAL_SALT);
  try {
    await query(`INSERT INTO
      employees(ID_Number,Managed_BY, Name, address,Phone_Number, Shift, Vale_company, Title, password)
      VALUES (?, ?, ?, ?, ?,?, ?, ?, ?);`,
      ID_Number, Managed_BY, Name, address,Phone_Number, Shift, Vale_company, Title, passwordHash);
    console.log(`Created account ${ID_Number}.`);
    req.session.identity = ID_Number;
    res.json({
      success: true
    });
  } catch (err) {
    console.error(`Error while creating account.`, req.body, err);
    res.status(500).send('Server Error');
  }
});



router.get('/find-cars', async (req, res) => {
    if (!(await isManager(req.session.identity))){
        res.status(401).send('You are unauthorized to perform this oppration');
        return;
    }
    const cars = await query('SELECT * from cars natural join parking;');
    res.json(cars);
});

router.get('/guests-list', async(req,res) =>
{
  if (!(await isManager(req.session.identity))){
    res.status(401).send('You are unauthorized to perform this oppration');
    return;
}
const guest = await query('SELECT * from guest;');
res.json(guest);
});

router.get('/show-drivers', async(req,res) =>{
    if (!(await isManager(req.session.identity))){
        res.status(401).send('You are unauthorized to perform this oppration');
        return;
    }
    const employee = await query('SELECT * from employees;');
    res.json(employee);

});




router.all('/debug', async (req, res) => {
  res.json({
    session: req.session
  });
});
router.get('/queries', async (req, res) => {
  if (!(await isManager(req.session.identity))) {
    res.status(401).send('Unauthorized');
    return;
  }
  const queries = [{
    label: 'First Query',
    columns: ['ID_Number', 'Ticket_Number' ],
    table: await query(`select employees.ID_Number, cars.Ticket_Number  from  employees join cars join parking on cars.Ticket_Number = parking.Ticket_Number and employees.ID_Number = Driver_ID where employees.ID_Number = 7;`)
  }, {
    label: 'Second Query',
    columns: ['Room_Number'],
    table: await query(`select Room_Number from cars where Description like '%BMW Gray%';`)
  }, {
      label: 'Third Query',
      columns: ['Name', 'ID_Number'],
      table: await query(`select Name, ID_Number from employees where Vale_company = 101;`)
    }, {
      label: 'Fourth Query',
      columns: ['Ticket_Number','Description','Room_Number'],
      table: await query(`select * from cars where Description like '%BLACK%' order by Ticket_Number;`)
    }, {
      label: 'Fifth Query',
      columns: ['Phone_Number'],
      table: await query(`select Phone_Number from employees where ID_Number = 20186;`)
    }, {
      label: 'Sixth Query',
      columns: ['ID_Number', 'Title'],
      table: await query(`select * from employees join Edet on ID_Number = ID_Num  where Title = 'MA' and Vac_days > 51;`)
    }, {
      label: 'Seventh Query',
      columns: ['Description'],
      table: await query(`select Description from cars natural join guest natural  join hotel natural join parking where hotel.Name = 'Helton' and Space_Number = 'D00';`)
    }, {
      label: 'Eighth Query',
      columns: ['ID_Number'],
      table: await query(`select Name, ID_Number from employees join parking on Driver_ID = ID_Number natural join cars where Room_Number ='P' ;`)
    }, {
      label: 'Ninth Query',
      columns: ['Name', 'Phone_Number'],
      table: await query(`select Name, Phone_Number from  employees join parking join cars where ID_Number = Driver_ID and cars.Ticket_Number = parking.Ticket_Number  and Description like '%Audi%';`)
    }, {
      label: 'Tenth Query',
      columns: ['FirstName', 'LastName'],
      table: await query(`select LastName, FirstName  from guest where Room_Number like '%917';`)
    }, {
      label: 'Eleventh Query',
      columns: ['FirstName', 'LastName' ],
      table: await query(`select LastName, FirstName from parking join guest join cars on cars.Room_Number = guest.Room_Number  where cars.Ticket_Number = parking.Ticket_Number and cars.Ticket_Number like '%13';`)
    }, {
      label: 'Twelfth Query ',
      columns: ['ID_Number', 'Name', 'PC'],
      table: await query(`select * from TPC where PC >2;`)
    }, {
      label: 'Thirteenth Query',
      columns: ['FirstName', 'LastName', ],
      table: await query(`select LastName, FirstName from guest join cars where cars.Room_Number = guest.Room_Number and Description like'%2000%';`)
    }, {
      label: 'Fourteenth Query',
      columns: ['count(Name)'],
      table: await query(`select count(Name) from employees where employees.Vale_company in (select valet_company.ID from hotel join valet_company where Contracted_Hotel = ID_Number and hotel.ID_Number = 343);`)
    }, {
      label: 'Fifteenth',
      columns: ['Name'],
      table: await query(`select Name from employees where ID_Number = 44 and Title = 'MA';`)
    }];

res.json(queries);
});

console.log('Waiting for database...');
initDB().then(() => {
  app.listen(port);
  console.log(`Running on port ${port}.`);
});