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
```
3. example output :
```bash
Apply complete! Resources: 19 added, 0 changed, 0 destroyed.

Outputs:

jumphost_public_ip = "18.208.229.108"
region = "us-east-1"
```
4. The command terraform state list is used to list all resources tracked in your current Terraform state file.
```bash
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
## ✅ step-8 and step-9 (Optional) 

## 🔍 Step 8: Get Docker Image URIs

1. Go to **ECR Console**
2. Click on `backend` → click the later images and open
   - Details
      - copy : URI
        ```bash
        421954350274.dkr.ecr.us-east-1.amazonaws.com/backend:1
        ```
4. Click on `frontend` → click the later images and open
   - Details
      - copy : URI
        ```bash
        421954350274.dkr.ecr.us-east-1.amazonaws.com/frontend:1
        ```

## 🔄 step 9: Updating ECR Images for Frontend and Backend Deployments
- This guide explains how to update the Amazon ECR Docker images used in Kubernetes manifests:
 - `kubernetes-files/frontend-deploy-service.yaml`
```bash
containers:
      - name: frontend
        image: 421954350274.dkr.ecr.us-east-1.amazonaws.com/frontend  # replace your frontend image
```

 - `kubernetes-files/backend-deployment.yaml`
```bash
containers:
  - name: backend
    image: 421954350274.dkr.ecr.us-east-1.amazonaws.com/backend   # replace your backend image
```

---


## 💻 Step 10: Connect to EC2 and Access Jenkins

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

## 🌐 Step 11: Jenkins Setup in Browser

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
## 🔐 Step 12: it is a (Optional) 
## 🔐 Step 12: Add AWS Credentials in Jenkins

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

## 🔌 Step 13: Install Jenkins Plugin

1. Jenkins Dashboard → **Manage Jenkins**
2. Go to: **Plugins**
3. Click **Available plugins**
4. Search for: `pipeline: stage view`
5. Install it


---

## 🛠️ Step 14: Create a Jenkins Pipeline Job (Create EKS Cluster)

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

## 🖥️ step 15 : Connect to Private RDS from Jumphost EC2

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
### 📊 Books Table Data (Sample Output)

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
## 🖥️ step 16 : 🎉 Install ArgoCD in Jumphost EC2

### 16.1: Create Namespace for ArgoCD

```bash
kubectl create namespace argocd
```

### 16.2: Install ArgoCD in the Created Namespace

```bash
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 16.3: Verify the Installation

```bash
kubectl get pods -n argocd
```

Ensure all pods are in `Running` state.

### 16.4: Validate the Cluster

Check your nodes and create a test pod if necessary:

```bash
kubectl get nodes
```

### 16.5: List All ArgoCD Resources

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

### 16.6: 🚀 Expose ArgoCD Server Using LoadBalancer

### 16.6.1: Edit the ArgoCD Server Service

```bash
kubectl edit svc argocd-server -n argocd
```

### 16.6.2: Change the Service Type

Find this line:

```yaml
type: ClusterIP
```

Change it to:

```yaml
type: LoadBalancer
```

Save and exit (`:wq` for `vi`).

### 16.6.3: Get the External Load Balancer DNS

```bash
kubectl get svc argocd-server -n argocd
```

Sample output:

```bash
NAME            TYPE           CLUSTER-IP     EXTERNAL-IP                           PORT(S)                          AGE
argocd-server   LoadBalancer   172.20.1.100   a1b2c3d4e5f6.elb.amazonaws.com        80:31234/TCP,443:31356/TCP       2m
```

### 16.6.4: Access the ArgoCD UI

Use the DNS:

```bash
https://<EXTERNAL-IP>.amazonaws.com
```

---

### 16.7: 🔐 Get the Initial ArgoCD Admin Password

```bash
kubectl get secret argocd-initial-admin-secret -n argocd \
  -o jsonpath="{.data.password}" | base64 -d && echo
```

### Login Details:

* **Username:** `admin`
* **Password:** (The output of the above command)

---

## Step 17: Create a Jenkins Pipeline Job for Backend and frondend & Route 53 Setup

### Prerequisites
1. Go to AWS Route 53
2. Create a Hosted Zone:
   - Domain: `aluru.site`
   - Type: Public Hosted Zone
3. Update Hostinger Nameservers:
   - Paste the 4 NS records from Route 53 into Hostinger:
     - ns-865.awsdns-84.net
     - ns-1995.awsdns-97.co.uk
     - ns-1418.awsdns-59.org
     - ns-265.awsdns-73.com

### Update Frontend API Endpoint
Go to `Client/src/pages/config.js` and update your API base URL:
```js
// const API_BASE_URL = "http://localhost:8800";
const API_BASE_URL = "http://aluru.site";
export default API_BASE_URL;
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://backend";
// export default API_BASE_URL;
// const API_BASE_URL = "REACT_APP_API_BASE_URL_PLACEHOLDER";
```
---

## 🔐 Step 17.1: Add GitHub PAT to Jenkins Credentials

1. Navigate to **Jenkins Dashboard** → **Manage Jenkins** → **Credentials** → **(global)** → **Global credentials (unrestricted)**.
2. Click **“Add Credentials”**.
3. In the form:
   - **Kind**: `Secret text`
   - **Secret**: `ghp_HKMTPOKYE2LLGuytsimxnnl5d1f73zh`
   - **ID**: `my-git-pattoken`
   - **Description**: `git credentials`
4. Click **“OK”** to save.


### 🚀 step 17.2: ⚖️ Jenkins Pipeline Setup: Frontend

1. Go to **Jenkins Dashboard**
2. Click **New Item**

   * Enter an item name: `frontend`
   * Select: **Pipeline**
   * Click **OK**
3. In the Pipeline section:

   * Scroll to **Pipeline** → **Definition: Pipeline script**
   * In **Script**, enter:

```bash
pipeline {
    agent any 

    stages {
        stage('Cleaning Workspace') {
            steps {
                cleanWs()
            }
        }
        stage('Checkout from Git') {
            steps {
                git branch: 'master', url: 'https://github.com/arumullayaswanth/Fullstack-nodejs-aws-eks-project.git'
            }
        }
        stage("Docker Image Build") {
            steps {
                script {
                    dir('client') {
                        sh 'docker system prune -f'
                        sh 'docker container prune -f'
                        sh 'docker build -t frontend .'
                    }
                }
            }
        }
        stage("ECR Image Pushing") {
            steps {
                script {
                    sh '''
                    #Retrieve an authentication token and authenticate your Docker client to your registry. Use the AWS CLI:
                    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 421954350274.dkr.ecr.us-east-1.amazonaws.com

                    #After the build completes, tag your image so you can push the image to this repository:
                    docker tag frontend:latest 421954350274.dkr.ecr.us-east-1.amazonaws.com/frontend:${BUILD_NUMBER}

                    #Run the following command to push this image to your newly created AWS repository:
                    docker push 421954350274.dkr.ecr.us-east-1.amazonaws.com/frontend:${BUILD_NUMBER}
                    '''
                }
            }
        }
        stage('Update Deployment file') {
            environment {
                GIT_REPO_NAME = "Fullstack-nodejs-aws-eks-project"
                GIT_USER_NAME = "arumullayaswanth"
            }
            steps {
                dir('kubernetes-files') {
                    withCredentials([string(credentialsId: 'my-git-pattoken', variable: 'git_token')]) {
                        sh '''
                            git config user.email "Yaswanth.arumulla@gmail.com"
                            git config user.name "arumullayaswanth"
                            BUILD_NUMBER=${BUILD_NUMBER}
                            echo $BUILD_NUMBER

                            # push this image to your git hub
                            sed -i "s#image:.*#image: 421954350274.dkr.ecr.us-east-1.amazonaws.com/frontend:$BUILD_NUMBER#g" frontend-deploy-service.yaml
                            git add .
                            git commit -m "Update deployment Image to version \${BUILD_NUMBER}"
                            git push https://${git_token}@github.com/${GIT_USER_NAME}/${GIT_REPO_NAME} HEAD:master
        
                        '''
                    }
                }
            }
        }
    }
}
```

4. Click **Save**
5. Click **Build Now**

---

### 🚀 step 17.3:  📂 Jenkins Pipeline Setup: Backend

1. Go to **Jenkins Dashboard**
2. Click **New Item**

   * Enter an item name: `backend`
   * Select: **Pipeline**
   * Click **OK**
3. In the Pipeline section:

   * Scroll to **Pipeline** → **Definition: Pipeline script**
   * In **Script**, enter:

```bash
pipeline {
    agent any 

    stages {
        stage('Cleaning Workspace') {
            steps {
                cleanWs()
            }
        }
        stage('Checkout from Git') {
            steps {
                git branch: 'master', url: 'https://github.com/arumullayaswanth/Fullstack-nodejs-aws-eks-project.git'
            }
        }
        stage("Docker Image Build") {
            steps {
                script {
                    dir('backend') {
                        sh 'docker system prune -f'
                        sh 'docker container prune -f'
                        sh 'docker build -t backend .'
                    }
                }
            }
        }
        stage("ECR Image Pushing") {
            steps {
                script {
                    sh '''
                    #Retrieve an authentication token and authenticate your Docker client to your registry. Use the AWS CLI:
                    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 421954350274.dkr.ecr.us-east-1.amazonaws.com

                    #After the build completes, tag your image so you can push the image to this repository:
                    docker tag backend:latest 421954350274.dkr.ecr.us-east-1.amazonaws.com/backend:${BUILD_NUMBER}

                    #Run the following command to push this image to your newly created AWS repository:
                    docker push 421954350274.dkr.ecr.us-east-1.amazonaws.com/backend:${BUILD_NUMBER}
                    '''
                }
            }
        }
        stage('Update Deployment file') {
            environment {
                GIT_REPO_NAME = "Fullstack-nodejs-aws-eks-project"
                GIT_USER_NAME = "arumullayaswanth"
            }
            steps {
                dir('kubernetes-files') {
                    withCredentials([string(credentialsId: 'my-git-pattoken', variable: 'git_token')]) {
                        sh '''
                            git config user.email "yaswanth.arumulla@gmail.com"
                            git config user.name "arumullayaswanth"
                            BUILD_NUMBER=${BUILD_NUMBER}
                            echo $BUILD_NUMBER

                            # push this image to your git hub
                            sed -i "s#image:.*#image: 421954350274.dkr.ecr.us-east-1.amazonaws.com/backend:$BUILD_NUMBER#g" backend-deployment.yaml
                            git add .
                            git commit -m "Update deployment Image to version \${BUILD_NUMBER}"
                            git push https://${git_token}@github.com/${GIT_USER_NAME}/${GIT_REPO_NAME} HEAD:master
                        '''
                    }
                }
            }
        }
    }
} 
```

4. Click **Save**
5. Click **Build Now**



---

## 🔍 Step 18: Creating Kubernetes Secret for RDS Access

This guide walks you through creating a Kubernetes `Secret` YAML file with your RDS credentials. These values need to be base64-encoded before being inserted into the secret manifest.

---

### 🔐 Step 18.1: Kubernetes Secret Configuration

Use the online tool [https://www.base64encode.org/](https://www.base64encode.org/) to encode each value.

#### ➔ Encode `RDS Endpoint`

1. Go to: [https://www.base64encode.org/](https://www.base64encode.org/)
2. Under **Encode to Base64 format**, enter your **RDS Endpoint** (e.g., `mydb.abcdefg.us-west-1.rds.amazonaws.com`)
3. Click **Encode**
4. Copy the **base64 encoded output**

#### ➔ Encode `RDS Username`

1. Repeat the steps above using your **RDS username** (eg., `admin`)
2. Copy the **base64 encoded output**

#### ➔ Encode `RDS Password`

1. Repeat the steps above using your **RDS password** (e.g., `yaswanth`)
2. Copy the **base64 encoded output**

---

## 📄 Step 18.2: Kubernetes Secret Configuration
- File: `kubernetes-files/secret.yaml`

- This secret stores sensitive information such as the RDS endpoint, username, and password, encoded in Base64.

## File: `kubernetes-files/secret.yaml`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  db_host: Ym9vay1yZHMuYzBuOGswYTBzd3R6LnVzLWVhc3QtMS5yZHMuYW1hem9uYXdzLmNvbQ==
  db_username: YWRtaW4=
  db_password: eWFzd2FudGg=
```

## Base64 Encoded Values

| Key          | Original Value     | Base64 Encoded                                  |
|--------------|--------------------|--------------------------------------------------|
| db_host      | RDS Endpoint       | `Ym9vay1yZHMuYzBuOGswYTBzd3R6LnVzLWVhc3QtMS5yZHMuYW1hem9uYXdzLmNvbQ==` |
| db_username  | RDS username       | `YWRtaW4=`                                       |
| db_password  | RDS password       | `eWFzd2FudGg=`                                   |

> ⚠️ These values are encoded with Base64 for use in Kubernetes Secrets. They are **not encrypted**, and should be treated as sensitive.


✅ You now have a Kubernetes secret containing your RDS credentials!



---

## Step 19:  Deploying with ArgoCD and Configuring Route 53 (Step-by-Step)

### Step 19.1: Create Namespace in EKS (from Jumphost EC2)
Run these commands on your jumphost EC2 server:
```bash
kubectl create namespace dev
kubectl get namespaces
```

### Step 19.2: Create New Applicatio with ArgoCD
1. Open the **ArgoCD UI** in your browser.
2. Click **+ NEW APP**.
3. Fill in the following:
   - **Application Name:** `project`
   - **Project Name:** `default`
   - **Sync Policy:** `Automatic`
   - **Repository URL:** `https://github.com/arumullayaswanth/Fullstack-nodejs-aws-eks-project.git`
   - **Revision:** `HEAD`
   - **Path:** `kubernetes-files`
   - **Cluster URL:** `https://kubernetes.default.svc`
   - **Namespace:** `dev`
4. Click **Create**.

### Step 19.3: Configure Route 53 for Backend
1. In ArgoCD UI, open your `project` application.
2. Click on **backend** and copy the hostname (e.g.,
   `acfb06fba08834577a50e43724d328e3-1568967602.us-east-1.elb.amazonaws.com`).
3. Go to **AWS Route 53** > **Hosted zones** > open your hosted zone (e.g., `aluru.site`).
4. Click **Create record** and fill in:
   - **Record type:** `A – Routes traffic to an IPv4 address and some AWS resources`
   - **Alias:** `Yes`
   - **Alias target:** Choose Application and Classic Load Balancer
   - **Region:** `US East (N. Virginia)`
   - **Alias target value:** Paste the backend load balancer DNS (from step 2)
5. Click **Create record**.

### 19.4: Verify Frontend Load Balancer Works
1. Go back to ArgoCD UI , open your `project` application.
2. Click on **frontend** and copy the hostname (e.g.,
   `a5c516a43689c44278448cfe1de09089-409723786.us-east-1.elb.amazonaws.com`).
3. To test if the frontend is working, paste the load balancer DNS in your browser:
   `http://a5c516a43689c44278448cfe1de09089-409723786.us-east-1.elb.amazonaws.com/`

### 5. ✅ (Optional) Add Frontend DNS in Route 53
1. In ArgoCD UI, open your `project` application.
2. Click on **frontend** and copy the hostname (e.g.,
   `acfb06fba08834577a50e43724d328e3-1568967602.us-east-1.elb.amazonaws.com`).
3. Go to **AWS Route 53** > **Hosted zones** > open your hosted zone (e.g., `aluru.site`).
4. Click **Create record** and fill in:
   - **Record type:** `A – Routes traffic to an IPv4 address and some AWS resources`
   - **Alias:** `Yes`
   - **Alias target:** Choose Application and Classic Load Balancer
   - **Region:** `US East (N. Virginia)`
   - **Alias target value:** Paste the frontend load balancer DNS (from step 2)
5. Click **Create record**.


### 6. 🔐 Enable HTTPS with ACM and Route 53 (Step-by-Step)

#### 6.1: Request a Public Certificate in ACM
1. Go to **AWS Certificate Manager (ACM)** in the AWS Console.
2. Click **Request a certificate**.
3. Select **Request a public certificate** and click **Next**.
4. Enter your domain name: `aluru.site` (and optionally `www.aluru.site`).
5. Choose **DNS validation (recommended)**.
6. Click **Request**.

#### 6.22: Validate Domain in Route 53
1. In ACM, go to **Certificates** and select your new certificate.
2. Under the domain, click **Create DNS record in Amazon Route 53**.
3. Select your hosted zone: `aluru.site`.
4. Click **Create record**.
5. Wait a few minutes for validation to complete (Status: **Issued**).

#### 6.3: Add HTTPS Listener to Load Balancer
1. Go to **EC2 Console** → **Load Balancers** → select your frontend ALB (e.g., `frontend-alb`).
2. Go to the **Listeners** tab.
3. Click **Add listener**:
   - **Protocol:** HTTPS
   - **Port:** 443
   - **Action:** Forward to your web target group
   - **Security policy:** ELBSecurityPolicy-2021-06 (or latest)
   - **Select ACM Certificate:** Choose the one for `aluru.site`
4. Click **Add**.

#### 6.4: Access Your Application
1. Open your browser and go to: https://aluru.site
2. Your application should now be accessible over HTTPS!
   
---

## 💣 Destroy All Terraform Resources

```bash
terraform destroy -auto-approve
```
- in ec2 instance
   - To verify deletion:
  ```bashS
  kubectl get namespaces
  ```
  ```bash
  kubectl delete namespace <namespace-name>
  kubectl delete all --all --all-namespaces
```
- eg: `kubectl delete namespace argocd`


