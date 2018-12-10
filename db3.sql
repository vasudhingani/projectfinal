create table hotel(
  ID_Number bigint(5) not null  primary key ,
  Name varchar(255) not null,
  Phone_Number bigint(10) not null
)engine=innodb;
insert into hotel values
                         (234, 'Mariot', 9023302 ),
                         (343, 'Retce', 10293004),
                         (102, 'Helton', 32304233394);

create table guest (
  Room_Number varchar(4) not null primary key,
  Hotel_ID bigint(5) not null,
  LastName varchar(255) not null ,
  FirstName varchar(255) default 'None',
  foreign key (Hotel_ID) references hotel(ID_Number)
  on DELETE cascade
  on UPDATE cascade
)engine=innodb;
insert into guest
values ('M230',234,'Hassan','Sara'),
       ('P',234,'Ploo','Ere'),
       ('M343',234,'Jones', 'ELizabeth'),
       ('H112', 102,'Sweets', 'Mike'),
       ('H452',102, 'Smith', 'Marven'),
       ('H002', 102, 'Miky', 'Reel'),
       ('R12R', 343, 'Obama', 'Barak'),
       ('R03R', 343, 'Alqaffas', 'Ahmed'),
       ('R22R', 343, 'Jones','ELizabeth' ),
       ('R43R', 343, 'Rod', 'Johnny');
insert into guest value ('H345', 102, 'Mr. Lyken', 'Kevin');
insert into guest value ('M234', 234, 'Blondie', 'Merdith');
insert into guest value ('M917', 234, 'Blackie', 'Ra');
insert into guest value ('R90R', 343, 'Sera', 'Milo');



create table  cars (
  Ticket_Number varchar(5) not null primary key,
  Description varchar(255) not null,
  Room_Number varchar(4) not null,
  foreign key (Room_Number) references guest(Room_Number)
  on UPDATE cascade
  on DELETE cascade
)engine=innodb;
  insert into cars values ('m01','2018 Benz Yellow','M230' ),
                          ('m98', '2018 Mazda CX-9 black', 'M343'),
                          ('h01', '2018 E-Class Blue','H112'),
                          ('h02','2010 BMW Gray','H452'),
                          ('h2321', '2019 Black Jeep Wrangler', 'H002' ),
                          ('m03', '2004 75 Rover Red', 'P'),
                          ('r645', '2018 Ford Mustang Black', 'R22R'),
                          ('r33','2018 Jaguar F-TYPE', 'R12R'),
                          ('r232','2019 Bugati Feron', 'R03R' ),
                          ('443', '2019 Benz 250','R43R');
  insert into cars value ('h255', '1999 white Audi R8', 'H345' );
  insert into cars value ('A013', '2000 white Lambo', 'R90R' );




create table parking (
  Space_Number varchar(5) default 'none ' primary key ,
  Type varchar(255) not null,
  Ticket_Number varchar(5) not null ,
  Time_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Driver_ID bigint(5) not null ,
  foreign key (Ticket_Number) references cars(Ticket_Number)
  on DELETE cascade
  on UPDATE cascade,

  foreign key (Driver_ID) references employees(ID_Number)
  on update cascade
  on delete cascade
)engine=innodb;



create table valet_company(
  ID bigint(4) not null primary key auto_increment,
  Name varchar(255) not null ,
  Phone_Number bigint(10)  not null,
  Sale_Count bigint(9),
  Contracted_Hotel bigint(5) not null ,
  foreign key (Contracted_Hotel) references hotel(ID_Number)
  on DELETE cascade
  on UPDATE cascade

)engine=innodb;

insert into valet_company values (100,'Speed Park',8093235545,1,234),
                                 (101, 'P Royal', 79832798,3,343),
                                 (102,'Beach Serves',8392829,2,102)
;


create table employees (
  ID_Number bigint(5) not null ,
  Managed_BY bigint(5) not null,
  Name varchar(255) not null ,
  Address varchar(255) not null ,
  Phone_Number bigint(10) not null ,
  Shift varchar(1) not null,
  Vale_company BIGINT(4) default 0,
  Title varchar(2),
  password varchar(255) check ( length(password)>7 ),
  PRIMARY KEY (ID_Number, Vale_company),
  foreign key (Vale_company) references valet_company(ID),
  check (Title in('MA', 'SU','DI','di','ma','su'))
)engine=innodb;
insert into employees values
                             (21 , 3,'Mten', 'Park Sweet', 80323326767,'a',101,'DI','1234567v'),
                             (12 , 3,'Sara', 'Park Sweet', 80323326767,'a',101,'DI','1234527v'),
                             (22 , 3,'Rick', 'Park Sweet',80323326767,'a',101,'SU','2565780933'),
                             (1 , 5,'Vasu', 'Park Plasa', 8043326767,'a',100,'DI','1234567wev'),
                             (2 , 4,'Viyat', '8 1/2', 8024435298, 'm',100, 'DI','1e232567v'),
                             (3, 4,'Ere', '8 1/2',8045027585, 'n',100, 'DI','4639894567v'),
                             (4, 5,'Darren', '8 1/2',8042958945,'a',100,'SU','ekgew9232'),
                             (5, 5,'E', 'Everywhere', 8045027583,'A',100,'MA','$2b$04$0C1ZMs9dTo80pglNyFweNOGKQriGeXQugkseUr25muB.7upIKo06K'),
                             (6, 4, 'Danial', '1200 W Marshall', 8099833345,'n',100,'DI','nsd642896'),
                             (7, 1, 'Katelyn', 'Cary Town',4303902345,'m',100,'DI','enwenewk12'),
                             (20186, 5, 'Mrs. Sandman', 'Arizona Forest', 2023458765, 'a', 102, 'DI','1234567v'  );

insert into employees value (44, 5, 'Johnny', ' Meyrland river housing', 8032324212,'n',102, 'MA','123wew4567v');
create table Edet(
  ID_Num bigint(5) primary key,
  Salary bigint(6) default 0,
  Vac_days bigint(3) default 10,
  foreign key (ID_Num) references employees (ID_Number)
  on update cascade
  on DELETE cascade
)engine=innodb;

insert into Edet values (1, 1500,20),
                        (2, 1500,20),
                        (3, 1500,20),
                        (4, 1500,20),
                        (5, 2000,31),
                        (6, 1500,20),
                        (7, 1500,20);
insert into Edet values (12, 784, 41),
                        (21,2330,51),
                        (22,1223, 10),
                        (20186,5876,0);
insert  into Edet value (44, 2321, 50);



create view TPC as
select  ID_Number, employees.Name, (select count(*) from parking where Driver_ID = employees.ID_Number ) AS 'PC' from employees;

create view ParkTypeCount as select type, count(*)as total from parking group by Type;

create view HVRefe as
select hotel.ID_Number, valet_company.ID from hotel join valet_company where Contracted_Hotel = ID_Number;
