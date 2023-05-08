import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { S3 } from './resources/s3';
import { Iam } from './resources/iam';
import { Lambda } from './resources/lambda';

export class NotionReaderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 定数定義
    // S3 Bucket Name
    const s3BucketName = "notion-reader-bucket";
    // IAM Policy Name
    const iamPolicyName = "notion-reader-policy";
    // IAM Role Name
    const iamRoleName = "notion-reader-role";
    // Lambda Function Name
    const lambdaFunctionName = "notion-reader-function";
    // EventBridge Rule Name
    const eventBridgeRuleName = "notion-reader-rule";
    // EventBridge Rule Schedule Expression
    const eventBridgeRuleScheduleExpression = "cron(0 0 * * ? *)";
    // EventBridge Rule Description
    const eventBridgeRuleDescription = "notion-reader-rule";
    // EventBridge Rule State
    const eventBridgeRuleState = "ENABLED";

    // S3 task
    // S3 Bucketを作成する
    const s3bucket = new S3();
    s3bucket.createS3(this, s3BucketName);

    // IAM task
    // IAM Policyを作成する
    const iam = new Iam();
    const iamPolicy = iam.createIamPolicy(this, iamPolicyName, s3BucketName);
    const iamRole = iam.createIamRoleForLambda(this, iamRoleName, iamPolicy);

    // Lambda task
    // Lambda Functionを作成する
    const lambda = new Lambda();
    lambda.createLambda(this, lambdaFunctionName, iamRole, s3BucketName);

  }
}
