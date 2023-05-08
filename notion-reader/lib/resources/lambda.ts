import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_lambda } from 'aws-cdk-lib';
import { aws_iam } from 'aws-cdk-lib';

export class Lambda {
    public lambdaFunction: aws_lambda.Function;

    constructor() { };

    public createLambda(scope: Construct, lambdaFunctionName: string, iamRole: aws_iam.Role, s3BucketName: string) {
        this.lambdaFunction = new aws_lambda.Function(scope, lambdaFunctionName, {
            functionName: lambdaFunctionName,
            runtime: aws_lambda.Runtime.PYTHON_3_8,
            code: aws_lambda.Code.fromAsset("lambda"),
            handler: "index.handler",
            role: iamRole,
            timeout: cdk.Duration.seconds(30),
            environment: {
                "S3_BUCKET_NAME": s3BucketName,
            },
        })
        return this.lambdaFunction;
    }
}