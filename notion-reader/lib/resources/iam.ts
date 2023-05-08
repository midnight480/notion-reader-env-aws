import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_iam } from 'aws-cdk-lib';

export class Iam {
    constructor(){};

    public iamPolicy: aws_iam.Policy;
    public iamPolicyDocument: aws_iam.PolicyDocument;
    public iamRole: aws_iam.Role;

    public createIamPolicy(scope: Construct, policyName: string, s3BucketName: string) {
        this.iamPolicy = new aws_iam.Policy(scope, policyName, {
            policyName: policyName,
            statements: [
                new aws_iam.PolicyStatement({
                    effect: aws_iam.Effect.ALLOW,
                    actions: [
                        "s3:GetObject",
                        "s3:ListBucket",
                        "s3:PutObject",
                        "s3:DeleteObject",
                    ],
                    resources: [
                        `arn:aws:s3:::${s3BucketName}/*`,
                        `arn:aws:s3:::${s3BucketName}`,
                    ],
                }),
            ]
        })
        return this.iamPolicy;
    }

    // AWS Lambda Execution Roleを作成する
    public createIamRoleForLambda(scope: Construct, roleName: string, iamPolicy: aws_iam.Policy) {
        this.iamRole = new aws_iam.Role(scope, roleName, {
            roleName: roleName,
            assumedBy: new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
        });
        this.iamRole.attachInlinePolicy(iamPolicy);
        return this.iamRole;
    }

}