

DROP TABLE if exists connector;

DROP TABLE if exists orders;
DROP TABLE if exists topping;
DROP TABLE if exists icecream;
DROP TABLE if exists brand;
DROP TABLE if exists user;

-- Table "Brand"---------------------------------
CREATE TABLE Brand (
    brand_id INT auto_increment PRIMARY KEY,
    brand_name VARCHAR(255) NOT NULL,
    brand_creation DATE,
    brand_slogan VARCHAR(255) NOT NULL,
    brand_provenance VARCHAR(255) NOT NULL
    
    
);

-- Table "IceCream"---------------------------------
CREATE TABLE IceCream (
    icecream_id INT auto_increment PRIMARY KEY,
    icecream_brand INT NOT NULL,
    icecream_name VARCHAR(255) NOT NULL,
    icecream_calory int NOT NULL,
    icecream_baseprice int NOT NULL,
    icecream_stock int NOT NULL,
    
    CONSTRAINT fk_icecream FOREIGN KEY (icecream_brand) REFERENCES Brand(brand_id),
    CONSTRAINT chk_price_icecream CHECK (icecream_baseprice>5)
);

-- Table "Topping"---------------------------------
CREATE TABLE Topping (
    topping_id INT auto_increment PRIMARY KEY,
    topping_name VARCHAR(255) NOT NULL,
    topping_price int NOT NULL,
    topping_allergen BOOLEAN,
    topping_calory int NOT NULL,
    topping_stock int NOT NULL,
    
    CONSTRAINT chk_price_topping CHECK (topping_price<10)
);

-- Table "Connector"-----------------------------------------------------------
CREATE TABLE Connector (
    conn_id INT auto_increment PRIMARY KEY,
    conn_icecream INT,
    conn_topping INT,
    
    CONSTRAINT fk_conn_glace FOREIGN KEY (conn_icecream) REFERENCES IceCream(icecream_id),
    CONSTRAINT fk_conn_topping FOREIGN KEY (conn_topping) REFERENCES Topping(topping_id)
);

-- Table "User"-----------------------------------------------------------
CREATE TABLE User (
    user_id INT auto_increment PRIMARY KEY,
    user_created datetime,
    user_name VARCHAR(255) NOT NULL unique,
    user_email VARCHAR(255) NOT NULL unique, 
    user_address VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) 
    
    
);

ALTER TABLE User MODIFY COLUMN user_created DATETIME DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE Orders (
    order_id INT PRIMARY KEY,
    user_id INT NOT NULL,
	icecream_id INT NOT NULL,
    topping_id INT NOT NULL,
    order_totalcalory int ,
    order_date DATE NOT NULL,
    order_totalprice int ,
   
    
    FOREIGN KEY (icecream_id) REFERENCES IceCream(icecream_id),
    FOREIGN KEY (topping_id) REFERENCES Topping(topping_id),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES User(user_id)
);


INSERT INTO Brand (brand_name, brand_creation, brand_slogan, brand_provenance) VALUES
    ('Magnum', '1989-03-10' , 'True to pleasure','Denmark'),
    ('HaagenDazs', '1976-11-15','Made like no other','United-States'),
    ('Ben&Jerrys','1978-05-05','Peace, love & ice cream','United-States');

INSERT INTO IceCream (icecream_brand, icecream_name, icecream_baseprice,icecream_calory,icecream_stock) VALUES
    (1, 'Magnum Double Chocolat', 8, 332, 15),
    (2, 'HaagenDazs Vanille', 7, 275, 17),
    (3, 'BenJerrys Cookie Dough', 9, 270,14)
    ;

INSERT INTO Topping (topping_name, topping_price,topping_allergen,topping_calory,topping_stock) VALUES
    ('Caramel', 2 , FALSE, 100, 10),
    ('Chocolat', 3, TRUE, 75, 12),
    ('Framboise', 2, FALSE, 64 ,10),
    ('Biscuit', 2, TRUE, 73,11),
    ('Chantilly', 1, FALSE, 38,10),
    ('Cacahuete', 1, TRUE, 60,12);

INSERT INTO Connector (conn_icecream, conn_topping) VALUES
    (1, 1), 
    (1, 2), 
    (1, 3), 
    (2, 1), 
    (2, 2), 
    (2, 3),
    (3, 1), 
    (3, 2), 
    (3, 3);

INSERT INTO User (user_created, user_name, user_email, user_address, user_password) VALUES
    ('2023-09-19 12:00:00', 'AnisDali', 'anis.dali@efrei.net', '47 Rue Dupont', '$2b$10$gG.cgILFH6jd45nefzg8.O/Gid6ShfMYvCRuFjDK8yL2DI3uti8my'),
    ('2023-09-20 10:30:00', 'LoukaMilan', 'louka.milan@efrei.net', '53 Rue Emile Zola', '$2b$10$wwsQv3m3vnZhKtQdoB1THu4CHpj7czG5/7J2TkCjQe1LOr0gUblZ6' ),
    ('2023-09-21 15:45:00', 'KevinTrinh', 'kevin.trinh@efrei.net', '93 Avenue Mozart', '$2b$10$qfSW624K20JpL.FPXR5XsOsWTQTliqjiZjj4jqnHltbirTBLSy7vu');
    
INSERT INTO Orders (order_id, user_id, icecream_id,topping_id,order_date) VALUES
    (1, 1,1,2, '2023-09-19'),
    (2, 2,2,2, '2023-09-20'),
    (3, 3,3,2,'2023-09-21');
    
UPDATE Orders AS o
JOIN Connector AS c ON o.icecream_id = c.conn_icecream AND o.topping_id = c.conn_topping
JOIN IceCream AS i ON o.icecream_id = i.icecream_id
JOIN Topping AS t ON o.topping_id = t.topping_id
SET o.order_totalcalory = i.icecream_calory + t.topping_calory,
    o.order_totalprice = i.icecream_baseprice + t.topping_price;


