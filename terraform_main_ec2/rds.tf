resource "aws_db_instance" "rds" {
  allocated_storage       = 20
  identifier              = "book-rds"
  db_subnet_group_name    = aws_db_subnet_group.sub-grp.id
  engine                  = "mysql"
  engine_version          = "8.4.7"
  instance_class          = "db.t3.micro"
  multi_az                = true
  db_name                 = "mydb"
  username                = "admin"
  password                = "yaswanth"
  skip_final_snapshot     = true
  vpc_security_group_ids  = [aws_security_group.security-group.id]
  depends_on              = [aws_db_subnet_group.sub-grp]
  publicly_accessible     = false
  backup_retention_period = 7
  deletion_protection     = false # Allow deletion of RDS instance

  tags = {
    DB_identifier = "book-rds"
  }
  # Ensure your IAM user/role has permissions for EC2 and RDS deletion
}

resource "aws_db_subnet_group" "sub-grp" {
  name       = "main"
  subnet_ids = [aws_subnet.private-subnet1.id, aws_subnet.private-subnet2.id]

  tags = {
    Name = "My DB subnet group"
  }
}

