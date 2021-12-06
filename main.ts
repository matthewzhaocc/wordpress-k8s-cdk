import { v4 as uuidv4 } from 'uuid'

import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';
import * as k8s from './imports/k8s'

export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    // Generated configurations
    const dbPass = uuidv4()

    // define database tier
    new k8s.KubeStatefulSet(this, 'wp-mysql', {
      spec: {
        template: {
          spec: {
            containers: [
              {
                image: 'mysql:latest',
                ports: [
                  {
                    protocol: 'TCP',
                    containerPort: 3306
                  }
                ],
                name: 'mysql-db',
                env: [
                  {
                    name: 'MYSQL_ROOT_PASSWORD',
                    value: dbPass
                  },
                  {
                    name: 'MYSQL'
                  }
                ]
              }
            ],
            
          },
          metadata: {
            labels: {
              app: 'wordpress-db'
            }
          }
        },
        selector: {
          matchLabels: {
            app: 'wordpress-db'
          }
        },
        serviceName: 'mysql'
      }
    })

  }
}

const app = new App();
new MyChart(app, 'wordpress-k8s-cdk', {namespace: process.env.KUBE_NAMESPACE || 'wordpress'});
app.synth();
