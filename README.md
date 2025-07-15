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
- example output :
``` bash
0c39f23132004d508132ae3e0a7c70e4
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
| Username  | yaswanth    |
| Password  | yaswanth    |
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
3. Name it: `eks-terraform`
4. Select: **Pipeline**
5. Click **OK**
 - Pipeline:
   - Definition : `Pipeline script from SCM`
   - SCM : `Git`
   - Repositories : `https://github.com/arumullayaswanth/Fullstack-nodejs-aws-eks-project.git`
   - Branches to build : `*/master`
   - Script Path : `eks-terraform/eks-jenkinsfile`
   - Apply
   - Save
6. click **Build with Parameters**
   - ACTION :
    - Select Terraform action : `apply`
    - **Build** 

- To verify your EKS cluster, connect to your EC2 jumphost server and run:
```bash
aws eks --region us-east-1 update-kubeconfig --name project-eks
kubectl get nodes
```

## 🖥️ step 14 : Connect to Private RDS from Jumphost EC2

- My challenge is my database created a new database now I am going to create insider database some existing records.

- whenever i access a frontend and existing records you can see first then you can add your record in this case database inside you need to run some script 

- So if your RDS database is private, you cannot connect directly from your local machine or external tools. Instead, use your EC2 Jumphost server to access and manage the database.

### Prerequisites
1. Go to AWS Console → RDS → select your DB instance (e.g., `book-rds`).
2. Copy the **Endpoint** value.
3. Note your credentials:
   - Username: `admin`
   - Password: `yaswanth`

### Steps to Connect and Import Data
1. SSH into your EC2 Jumphost instance:
   ```bash
   ssh -i <your-key.pem> ec2-user@<jumphost-public-ip>
   sudo -i
   ```
2. Clone your project and navigate to the backend folder:
   ```bash
   git clone https://github.com/arumullayaswanth/Fullstack-nodejs-aws-eks-project.git
   cd Fullstack-nodejs-aws-eks-project/backend/
   ```

3. Import your initial data into the RDS database:
   ```bash
   mysql -h <your-rds-endpoint> -u admin -p < test.sql
   # When prompted, enter your password: yaswanth
   ```
   **Example:**
   ```bash
   mysql -h book-rds.c0n8k0a0swtz.us-east-1.rds.amazonaws.com -u admin -p < test.sql
   # Password: yaswanth
   ```

4. Verify your database tables are created:
   ```bash
   mysql -h <your-rds-endpoint> -u admin -p
   # Enter password: yaswanth
   ```
   Then in the MySQL prompt:
   ```sql
   SHOW DATABASES;
   USE test;
   SHOW TABLES;
   DESCRIBE books;
   SELECT * FROM books;
   exit
   ```
## 📊 Books Table Data (Sample Output)

```text
+----+------------+------------------------------------------------+--------+---------------------------------------------------------------+
| id | title      | desc                                           | price  | cover                                                         |
+----+------------+------------------------------------------------+--------+---------------------------------------------------------------+
| 1  | MultiCloud | this is multicloud with devops...              | 2343.2 | https://docs.multy.dev/assets/images/...                      |
| 2  | DevOps     | if you understand the devops it is very easy   | 2342.3 | https://media.licdn.com/dms/image/...                         |
+----+------------+------------------------------------------------+--------+---------------------------------------------------------------+
```
   This will list all tables in your database.

**Note:**
- You must run this from the EC2 instance in the same VPC as your RDS (the Jumphost).
- If you want to use MySQL Workbench or other tools, set up an SSH tunnel through the Jumphost.
---
## 🖥️ step 15 : 🎉 Install ArgoCD

### 1. Create Namespace for ArgoCD

```bash
kubectl create namespace argocd
```

### 2. Install ArgoCD in the Created Namespace

```bash
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 3. Verify the Installation

```bash
kubectl get pods -n argocd
```

Ensure all pods are in `Running` state.

### 4. Validate the Cluster

Check your nodes and create a test pod if necessary:

```bash
kubectl get nodes
```

### 5. List All ArgoCD Resources

```bash
kubectl get all -n argocd
```

Sample output:

```
NAME                                                    READY   STATUS    RESTARTS   AGE
pod/argocd-application-controller-0                     1/1     Running   0          106m
pod/argocd-applicationset-controller-787bfd9669-4mxq6   1/1     Running   0          106m
pod/argocd-dex-server-bb76f899c-slg7k                   1/1     Running   0          106m
pod/argocd-notifications-controller-5557f7bb5b-84cjr    1/1     Running   0          106m
pod/argocd-redis-b5d6bf5f5-482qq                        1/1     Running   0          106m
pod/argocd-repo-server-56998dcf9c-c75wk                 1/1     Running   0          106m
pod/argocd-server-5985b6cf6f-zzgx8                      1/1     Running   0          106m
```

---

## 3. 🚀 Expose ArgoCD Server Using LoadBalancer

### 1. Edit the ArgoCD Server Service

```bash
kubectl edit svc argocd-server -n argocd
```

### 2. Change the Service Type

Find this line:

```yaml
type: ClusterIP
```

Change it to:

```yaml
type: LoadBalancer
```

Save and exit (`:wq` for `vi`).

### 3. Get the External Load Balancer DNS

```bash
kubectl get svc argocd-server -n argocd
```

Sample output:

```bash
NAME            TYPE           CLUSTER-IP     EXTERNAL-IP                           PORT(S)                          AGE
argocd-server   LoadBalancer   172.20.1.100   a1b2c3d4e5f6.elb.amazonaws.com        80:31234/TCP,443:31356/TCP       2m
```

### 4. Access the ArgoCD UI

Use the DNS:

```bash
https://<EXTERNAL-IP>.amazonaws.com
```

---

## 4. 🔐 Get the Initial ArgoCD Admin Password

```bash
kubectl get secret argocd-initial-admin-secret -n argocd \
  -o jsonpath="{.data.password}" | base64 -d && echo
```

### Login Details:

* **Username:** `admin`
* **Password:** (The output of the above command)
---
