-- Global halal product classification: add Pharmaceuticals + Ingredients & Additives
-- (SMIIC/OIC + SGIE scope: pharma and food ingredients are core halal verticals).
INSERT INTO categories (slug, name, description, parent_slug, icon, sort_order, created_at, updated_at) VALUES
('pharmaceuticals','Pharmaceuticals','Halal-certified medicines, vaccines and health products — no porcine gelatin, alcohol or haram excipients.',NULL,'Syringe',0,1789500000,1789500000),
('ingredients-additives','Ingredients & Additives','Halal-certified food ingredients, flavours, enzymes, emulsifiers and processing aids for manufacturers.',NULL,'FlaskConical',0,1789500000,1789500000);
