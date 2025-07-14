# 🚀 Fullstack Node.js AWS EKS Project Deployment Guide

This is a step-by-step guide to deploy the fullstack project using Terraform, Jenkins, AWS, and Docker. Follow along like a recipe! 🍰

---

## ✅ Step 1: Clone the GitHub Repository

1. Open **VS Code**.
2. Open the terminal in VS Code.
3. Clone the project:

```bash
git clone https://github.com/arumullayaswanth/Fullstack-nodejs-aws-eks-project.git
```

---

## 🔐 Step 2: Configure AWS Keys

Make sure you have your AWS credentials configured. Run:

```bash
aws configure
```

Enter your:
- Access Key ID
- Secret Access Key
- Region (like `us-east-1`)
- Output format (leave it as `json`)

---

## 📁 Step 3: Navigate into the Project

```bash
ls
cd Fullstack-nodejs-aws-eks-project
ls
```

---

## ☁️ Step 4: Create S3 Buckets for Terraform State

These buckets will store `terraform.tfstate` files.

```bash
cd s3-buckets/
ls
terraform init
terraform plan
terraform apply -auto-approve
```

---

## 🌐 Step 5: Create Network and Database

1. Navigate to Terraform EC2 folder:

```bash
cd ../terraform_main_ec2
```

2. Run Terraform:

```bash
terraform init
terraform plan
terraform apply -auto-approve
terraform state list
```

---

## 🐳 Step 6: Create Backend Image Repository (ECR)

Go to **AWS Console**:

1. Search for: `Elastic Container Registry`
2. Click **Private Registry**
3. Click **Private Repositories**
4. Click **Create repository**
5. Repository name: `backend`
6. Click **Create repository**

---

## 🎨 Step 7: Create Frontend Image Repository (ECR)

Repeat the same steps as above:

1. Search for: `Elastic Container Registry`
2. Click **Private Registry** > **Private Repositories**
3. Click **Create repository**
4. Repository name: `frontend`
5. Click **Create repository**

---

## 🔍 Step 8: Get Docker Image URIs

1. Go to **ECR Console**
2. Click on `backend` → Copy the image URI (we’ll use it later)
3. Click on `frontend` → Copy the image URI

---

## 💻 Step 9: Connect to EC2 and Access Jenkins

1. Go to **AWS Console** → **EC2**
2. Click your instance → Connect
3. Once connected, switch to root:

```bash
sudo -i
```

4. Check Jenkins is installed:

```bash
jenkins --version
```

5. Get the initial Jenkins admin password:

```bash
cat /var/lib/jenkins/secrets/initialAdminPassword
```

Copy that password!

---

## 🌐 Step 10: Jenkins Setup in Browser

1. Open browser and go to:

```
http://<EC2 Public IP>:8080
```

2. Paste the password from last step.
3. Click **Install suggested plugins**
4. Create first user:

| Field     | Value       |
|-----------|-------------|
| Username  | terraform   |
| Password  | terraform   |
| Full Name | yaswanth    |
| Email     | yash@example.com |

Click through: **Save and Continue → Save and Finish → Start using Jenkins**

---

## 🔐 Step 11: Add AWS Credentials in Jenkins

1. In Jenkins Dashboard → **Manage Jenkins**
2. Go to: **Credentials → System → Global Credentials (unrestricted)**
3. Click **Add Credentials**

### Add Access Key:
- Kind: Secret Text
- Secret: _your AWS Access Key_
- ID: `accesskey`
- Description: AWS Access Key

### Add Secret Key:
- Kind: Secret Text
- Secret: _your AWS Secret Key_
- ID: `secretkey`
- Description: AWS Secret Key

Click **Save** for both.

---

## 🔌 Step 12: Install Jenkins Plugin

1. Jenkins Dashboard → **Manage Jenkins**
2. Go to: **Plugins**
3. Click **Available plugins**
4. Search for: `pipeline: stage view`
5. Install it


---

## 🛠️ Step 13: Create a Jenkins Pipeline Job

1. Go to Jenkins Dashboard
2. Click **New Item**
3. Name it: `terraform-deploy`
4. Select: **Pipeline**
5. Click **OK**
6. Scroll to **Pipeline Script**, and paste your pipeline code (you can build it in next steps)
