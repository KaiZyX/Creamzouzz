
DROP TABLE if exists orderdetails;
DROP TABLE if exists orders;
DROP TABLE if exists cart;
DROP TABLE if exists user;
DROP TABLE if exists connector;
DROP TABLE if exists topping;
DROP TABLE if exists icecream;
DROP TABLE if exists brand;

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
    icecream_description TEXT,
    icecream_image TEXT,
    
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
    topping_description TEXT,
    topping_image TEXT,
    
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
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL unique, 
    user_address VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) 
    
    
);

ALTER TABLE User MODIFY COLUMN user_created DATETIME DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE Orders (
    order_id INT auto_increment PRIMARY KEY,
    user_id INT NOT NULL,
    order_date DATE NOT NULL,
    order_totalprice DECIMAL(10, 2) NOT NULL, -- Le prix total de la commande
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE OrderDetails (
    detail_id INT auto_increment PRIMARY KEY,
    order_id INT NOT NULL,
    product_type ENUM('icecream', 'topping') NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- Le prix à l'unité du moment de la commande
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);

CREATE TABLE cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    icecream_id INT NULL,
    topping_id INT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (icecream_id) REFERENCES IceCream(icecream_id),
    FOREIGN KEY (topping_id) REFERENCES Topping(topping_id)
);



INSERT INTO Brand (brand_name, brand_creation, brand_slogan, brand_provenance) VALUES
    ('Magnum', '1989-03-10' , 'True to pleasure','Denmark'),
    ('HaagenDazs', '1976-11-15','Made like no other','United-States'),
    ('Ben&Jerrys','1978-05-05','Peace, love & ice cream','United-States');

INSERT INTO IceCream (icecream_brand, icecream_name, icecream_baseprice,icecream_calory,icecream_stock,icecream_description,icecream_image) VALUES
    (1, 'Magnum', 8, 332, 15,'A Magnum ice cream with crunchy chocolate let yourself be carried away by this taste','https://mojood.ma/wp-content/uploads/2022/02/8714100289969_PHOTOSITE_20210429_170050_0.jpg'),
    (2, 'HaagenDazs Vanille', 7, 275, 17,'A desire for sweetness, Ben&Jerry ice cream is for you','https://www.benandjerrys.ca/files/live/sites/systemsite/files/flavors/products/aa/pints/open-closed-pints/choc-chip-cookie-dough-landing.png'),
    (3, 'BenJerrys Cookie Dough', 9, 270,14,'Fall in love with the special vanilla of Haagen-Dazs','data:image/jpeg;base64,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')
    ;

INSERT INTO Topping (topping_name, topping_price,topping_allergen,topping_calory,topping_stock,topping_description,topping_image) VALUES
    ('Caramel', 2 , FALSE, 100, 10,'A little more sugar to your masterpiece','https://athome.starbucks.com/sites/default/files/styles/homepage_banner_xlarge/public/2023-01/CAH_CaramelSyrup_Hdr_2880x1660.jpg.webp?itok=mOvsP-lu'),
    ('Chocolat', 3, TRUE, 75, 12,'Chocolate lover?','https://www.leparisien.fr/resizer/sqhdr6yegDjJCsgcjbqLGrtrTP8=/932x582/cloudfront-eu-central-1.images.arcpublishing.com/leparisien/NWOI3QZBXVEJLBE2B7GXLHBAL4.jpg'),
    ('Raspberries', 2, FALSE, 64 ,10,'Straight out of the garden','https://www.matierebrutelab.com/blog/wp-content/uploads/2022/08/framboises.jpg'),
    ('Smarties', 2, TRUE, 73,11,'Fall back into childhood','https://p6.focus.de/img/fotos/id_13450842/m-m-choclate-gettyimages-911654750.jpg?im=Resize%3D%28800%2C600%29&impolicy=perceptual&quality=mediumHigh&hash=4a15aadb569970535a953b75dcac99accb1424b03193ff9715e2b934311f59d3'),
    ('Chantilly', 1, FALSE, 38,10,'Add a little sweetness','https://www.academiedugout.fr/images/75754/948-580/adobestock_107198209.jpeg?poix=50&poiy=50'),
    ('Peanuts', 1, TRUE, 60,12,'Always good to add','https://file1.topsante.com/var/topsante/storage/images/medecine/troubles-cardiovasculaires/avc/prevenir/les-cacahuetes-reduiraient-le-risque-de-maladies-cardiovasculaires-245717/5661399-1-fre-FR/Les-cacahuetes-reduiraient-le-risque-de-maladies-cardiovasculaires.jpg?alias=original');

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
	('2023-09-19 12:00:00', 'Anonyme', 'Anonyme@efrei.net', 'Anonyme', '$2b$10$wApnPsumVV39bmIfHyQKJed.fzvDgNsXfsycDRmBhO3ldiuQoCMrK'),
    ('2023-09-19 12:00:00', 'AnisDali', 'anis.dali@efrei.net', '47 Rue Dupont', '$2b$10$wApnPsumVV39bmIfHyQKJed.fzvDgNsXfsycDRmBhO3ldiuQoCMrK'),
    ('2023-09-20 10:30:00', 'LoukaMilan', 'louka.milan@efrei.net', '53 Rue Emile Zola', '$2b$10$RZR96/ygRtXDn3n6eN1bFOqOu1GiI9w3sRmLRJ7BG92/If3/1X6NC' ),
    ('2023-09-21 15:45:00', 'KevinTrinh', 'kevin.trinh@efrei.net', '93 Avenue Mozart', '$2b$10$QS3/HUsSQiB8U3FMsMZstOaaKlTwTvOHDLLxuILQbiX9x2rzpD.M.');
    
INSERT INTO Orders (user_id, order_date, order_totalprice) VALUES
    (1, '2023-09-19', 0),  -- Le prix total sera mis à jour plus tard
    (2, '2023-09-20', 0),
    (3, '2023-09-21', 0);

INSERT INTO OrderDetails (order_id, product_type, product_id, quantity, price) VALUES
    (1, 'icecream', 1, 1, 8),   -- 1 Magnum 
    (1, 'topping', 2, 2, 3),    -- 2 Chocolat
    (2, 'icecream', 2, 1, 7),   -- 1 HaagenDazs Vanille
    (3, 'icecream', 3, 2, 9),   -- 2 BenJerrys Cookie Dough
    (3, 'topping', 5, 1, 1);    -- 1 Chantilly

UPDATE Orders o
SET o.order_totalprice = (
    SELECT SUM(d.price * d.quantity)
    FROM OrderDetails d
    WHERE d.order_id = o.order_id
);



