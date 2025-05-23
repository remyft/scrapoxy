# Amazon Web Services Connector

![AWS](/assets/images/aws.svg){width=150, nozoom}

[Amazon Web Services](/l/aws) is a subsidiary of Amazon that provides on-demand cloud computing.


## Prerequisites

An active subscription to Amazon Web Services (AWS) is required.


## AWS Console

Connect to [AWS Console](/l/aws-console).

There are 2 methods for generating a new credential with AWS:

1. With an IAM user, a more secure approach albeit with increased complexity.
2. With the Root user, which is easier but not recommended for security reasons.


## With an IAM user

This is the recommended method for generating a new credential with AWS.

![AWS Credentials](aws_credentials.png)

1. On the top right, click on your name to open the menu;
2. And click on `Security credentials`.

---

![AWS Usergroup Add Select](aws_usergroup_add_select.png)

1. On the left, click on `User groups`;
2. And click on `Create group`.

---

![AWS Usergroup Add](aws_usergroup_add.png)

1. Enter `scrapoxy` as group name;
2. Search for `AmazonEC2FullAccess`;
3. Select it;
4. And click on `Create group`.

---

![AWS User Add Select](aws_user_add_select.png)

1. On the left, click on `Users`;
2. And click on `Create user`.

---

![AWS User Add Step 1](aws_user_add_step1.png)

1. Enter `scrapoxy` as user name;
2. And click on `Next`.

---

![AWS User Add Step 2](aws_user_add_step2.png)

1. Select `Add user to group`;
2. Select `scrapoxy` as group;
3. And click on `Next`.

---

![AWS User Add Step 3](aws_user_add_step3.png)

Click on `Create user`.

---

![AWS User Select](aws_user_select.png)

Click on the user `scrapoxy`.

---

![AWS User Credentials Create Step 1](aws_user_credentials_create_step1.png)

1. Select `Security credentials` tab;
2. And click on `Create access key`.

---

![AWS User Credentials Create Step 2](aws_user_credentials_create_step2.png)

1. Select `Command Line Interface (CLI)`;
2. Check the confirmation box;
3. And click on `Next`.

---

![AWS User Credentials Create Step 3](aws_user_credentials_create_step3.png)

Click on `Create access key`.

---

![AWS User Credentials Create Step 4](aws_user_credentials_create_step4.png)

1. Remember the `Access key`;
2. Remember the `Secret access key`;
3. And click on `Done`.



## With the Root user

This method is not recommended for security reasons.

![AWS Credentials](aws_credentials.png)

1. On the top right, click on your name to open the menu;
2. And click on `Security credentials`.

---

![AWS Credential Create](aws_credential_create.png)

Click on `Create access key`.

---

![AWS Credential Not Recommended](aws_credential_not_recommended.png)

1. Check the box;
2. And click on `Create access key`.

---

![AWS Credential Save](aws_credential_save.png)

Remember the `Access key ID` and the `Secret access key` values.


## Scrapoxy

Open Scrapoxy User Interface and select `Marketplace`:


### Step 1: Create a new credential

![Credential Select](spx_credential_select.png)

Select `AWS` to create a new credential (use search if necessary).

---

![Credential Form](spx_credential_create.png)

Complete the form by entering the following information:
1. **Name**: Specify the unique name for the credential;
2. **Access key ID**: Provide the Access Key ID associated with the account;
3. **Secret access key**: Enter the Client Secret associated with the account.

And click on `Create`.


### Step 2: Create a new connector

Create a new connector:

![Connector Create](spx_connector_create.png)

Complete the form with the following information:
1. **Credential**: The previous credential;
2. **Name**: The name of the connector;
3. **# Proxies**: The number of instances to create;
4. **Region**: The region where the instances will be created;
5. **Port**: The port of the proxy (on AWS);
6. **Instance Type**: The type of the instance;
7. **Image ID**: The name of the image in the region;
8. **Security group name**: The name of the security group containing the firewall rules;
9. **Tag**: The default tag for instance.

And click on `Create`.

Most default values can be retained if suitable for the use case.

::: warning
When setting up the connector in multiple regions, assign a unique **Image ID** and distinct **Tag** for each region. 
Without this, connectors may interfere with each other, shutting down instances from the same provider.
:::


### Step 3: Start the connector

![Connector Start](spx_connector_start.png)

1. Start the project;
2. Start the connector.


### Step 4: Stop the connector (optional)

![Connector Stop](spx_connector_stop.png)

1. Stop the connector;
2. Wait for proxies to be removed.
