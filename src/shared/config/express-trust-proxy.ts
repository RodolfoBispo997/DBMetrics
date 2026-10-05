export interface ExpressTrustProxyApplication {
  set(setting: "trust proxy", hops: 1): unknown;
}

export function configureExpressTrustProxy(
  application: ExpressTrustProxyApplication,
): void {
  // Trust only the ALB hop; the ECS task security group accepts traffic only from the ALB.
  application.set("trust proxy", 1);
}
