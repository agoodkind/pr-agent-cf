FROM ghcr.io/agoodkind/pr-agent@sha256:4fc75f84135c6ef34b9759df548e5e980c78a2edd34f577bfdf10c91cc4a46aa

ENV HOME=/tmp

USER 65534:65534

EXPOSE 3000
