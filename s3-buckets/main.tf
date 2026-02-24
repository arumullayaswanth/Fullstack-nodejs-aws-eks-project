provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "bucket1" {
  bucket = "booksec2"
  # Allow Terraform destroy to remove the bucket even when it contains objects/versions.
  force_destroy = true

  tags = {
    Name        = "booksec2"
    Environment = "dev"
  }
}

resource "aws_s3_bucket_versioning" "bucket1_versioning" {
  bucket = aws_s3_bucket.bucket1.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket" "bucket2" {
  bucket = "bookseks"
  # Allow Terraform destroy to remove the bucket even when it contains objects/versions.
  force_destroy = true

  tags = {
    Name        = "bookseks"
    Environment = "dev"
  }
}

resource "aws_s3_bucket_versioning" "bucket2_versioning" {
  bucket = aws_s3_bucket.bucket2.id
  versioning_configuration {
    status = "Enabled"
  }
}
